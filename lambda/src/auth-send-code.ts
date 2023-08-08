import { getUserByPhone, setVerifed } from './db/utils/repository';
import { sendCode } from './utils/auth';
import { getErrors, validateSendCode } from './utils/validation';

export async function handler(event: SendCodeEvent): Promise<EventResult<void>> {
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
        errors: [`user with phone = ${phone} already exists`],
      };
    }
    if (user.verified) {
      await setVerifed(phone, false);
    }
  }

  const status = await sendCode(event);

  return status !== 'pending'
    ? {
      success: false,
      errors: [`send code status is ${status}`]
    }
    : {
      success: true,
    };
};
