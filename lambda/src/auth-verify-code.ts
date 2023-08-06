import { createUser } from './db/utils/repository';
import { verifyCode } from './utils/auth';
import { getErrors, validateVerifyCode } from './utils/validation';

export async function handler(event: VerifyCodeEvent): Promise<EventResult<UserDM>> {
  const validationResult = validateVerifyCode(event);
  if (!validationResult.success) {
    return {
      valid: false,
      errors: getErrors(validationResult),
    };
  }

  const verifyStatus = await verifyCode(event);

  if (verifyStatus !== 'approved') {
    return {
      valid: false,
      errors: [
        `verify code status is ${verifyStatus}`
      ],
    };
  }

  const user = await createUser(event);

  return {
    valid: true,
    data: user,
  };
};
