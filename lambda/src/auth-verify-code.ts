import { createUser } from './db/utils/repository';
import { verifyCode } from './utils/auth';
import { getErrors, validateVerifyCode } from './utils/validation';

export async function handler(event: VerifyCodeEvent): Promise<EventResult<UserDM>> {
  const validationResult = validateVerifyCode(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const verifyCodeResult = await verifyCode(event);

  if (verifyCodeResult.error) {
    return {
      success: false,
      errors: [verifyCodeResult.error]
    };
  }

  const createUserResult = await createUser(event);

  return createUserResult.error
    ? {
      success: false,
      errors: [createUserResult.error],
    }
    : {
      success: true,
      data: createUserResult.data as UserDM,
    };
};
