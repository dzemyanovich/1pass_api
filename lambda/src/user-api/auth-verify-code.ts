import { getUserByPhone, setVerifed } from '../db/utils/repository';
import { verifyCode } from '../utils/auth';
import { userExists, userNotFound, incorrectVerifyCode, verifyCodeError } from '../utils/errors';
import { getErrors, validateVerifyCode } from '../utils/validation';

export async function handler(event: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  const validationResult = validateVerifyCode(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { phone } = event;
  const user = await getUserByPhone(phone);

  if (!user) {
    return {
      success: false,
      errors: [userNotFound()],
    };
  }

  if (user.password) {
    return {
      success: false,
      errors: [userExists(phone)],
    };
  }

  let status = null;
  try {
    status = await verifyCode(event);
  } catch (error) { // error occurs e.g. if you try to make verification w/o sending code before
    // eslint-disable-next-line no-console
    console.error(error);

    return {
      success: false,
      errors: [verifyCodeError()],
    };
  }

  if (status !== 'approved') {
    // eslint-disable-next-line no-console
    console.error(`verify code status should be "approved" however it is "${status}"`);

    return {
      success: false,
      errors: [incorrectVerifyCode()],
    };
  }

  await setVerifed(phone, true);

  return {
    success: true,
  };
}
