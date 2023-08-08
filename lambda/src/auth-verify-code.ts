import { getUserByPhone, createUser, setVerifed } from './db/utils/repository';
import { verifyCode } from './utils/auth';
import { getErrors, validateVerifyCode } from './utils/validation';

export async function handler(event: VerifyCodeEvent): Promise<EventResult<void>> {
  const validationResult = validateVerifyCode(event);
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
        errors: [`user with phone = ${phone} already exists`],
      };
    }
  }

  const status = await verifyCode(event);

  if (status !== 'approved') {
    return {
      success: false,
      errors: [`verify code status is ${status}`],
    };
  }

  if (user) {
    if (user.verified) {
      return {
        success: true,
      };
    }

    await setVerifed(phone, true);

    return {
      success: true,
    };
  }

  await createUser(event);

  return {
    success: true,
  };
};
