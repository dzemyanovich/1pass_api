import { signIn } from './db/utils/repository';
import { userNotFound } from './utils/errors';
import { getErrors, validateSignIn } from './utils/validation';

export async function handler(event: SignInEvent): Promise<EventResult<void>> {
  const validationResult = validateSignIn(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const user = await signIn(event);

  return user
    ? {
      success: true,
    }
    : {
      success: false,
      errors: [userNotFound()],
    };
};
