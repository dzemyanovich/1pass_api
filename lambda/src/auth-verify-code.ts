import { getUserByPhone, setVerifed } from './db/utils/repository';
import { verifyCode } from './utils/auth';
import { userExists, userNotFound, verifyCodeStatus } from './utils/errors';
import { getErrors, validateVerifyCode } from './utils/validation';

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

  const status = await verifyCode(event);

  if (status !== 'approved') {
    return {
      success: false,
      errors: [verifyCodeStatus(status)],
    };
  }

  await setVerifed(phone, true);

  return {
    success: true,
  };
}
