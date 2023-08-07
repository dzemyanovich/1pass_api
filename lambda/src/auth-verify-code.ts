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
  const verifyCodeErrors = verifyCodeResult.errors;

  if (verifyCodeErrors.length) {
    return {
      success: false,
      errors: verifyCodeErrors,
    };
  }

  const createUserResult = await createUser(event);
  const { errors, data } = createUserResult;

  return errors.length
    ? {
      success: false,
      errors,
    }
    : {
      success: true,
      data: data as UserDM,
    };
};
