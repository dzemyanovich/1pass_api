import { createUser, getUserByPhone, setVerifed } from '../db/utils/repository';
import { sendCode } from '../utils/auth';
import { sendCodeError, userExists } from '../utils/errors';
import { getErrors, validateSendCode } from '../utils/validation';

export async function handler(event: SendCodeRequest): Promise<SendCodeResponse> {
  const validationResult = validateSendCode(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { phone } = event;
  const user = await getUserByPhone(phone);
  if (user) {
    if (user.password) {
      return {
        success: false,
        errors: [userExists(phone)],
      };
    }
    if (user.verified) {
      await setVerifed(phone, false);
    }
  }

  const status = await sendCode(event);

  if (status !== 'pending') {
    // eslint-disable-next-line no-console
    console.error(`send code status should be "pending" however it is "${status}"`);

    return {
      success: false,
      errors: [sendCodeError()],
    };
  }

  if (!user) {
    await createUser(phone);
  }

  return {
    success: true,
  };
}
