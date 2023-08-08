import { getSignInUser, signUp } from './db/utils/repository';
import { getErrors, validateSignIn } from './utils/validation';

export async function handler(event: SignInEvent): Promise<EventResult<void>> {
  const validationResult = validateSignIn(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const user = await getSignInUser(event);

  return user
    ? {
      success: true,
    }
    : {
      success: false,
      errors: ['user not found'],
    };
};
