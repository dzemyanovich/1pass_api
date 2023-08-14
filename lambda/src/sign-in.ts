import { signIn } from './db/utils/repository';
import { getToken } from './utils/auth';
import { userNotFound } from './utils/errors';
import { getErrors, validateSignIn } from './utils/validation';

// todo: update all tests using signIn functionality (add check for token)
export async function handler(event: SignInEvent): Promise<EventResult<string>> {
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
      data: getToken(user.id as number),
    }
    : {
      success: false,
      errors: [userNotFound()],
    };
}
