import { signUp } from './utils/auth';
import { getErrors, validateSignUp } from './utils/validation';

export async function handler(event: SignUpEvent): Promise<EventResult<boolean>> {
  const validationResult = validateSignUp(event);
  if (!validationResult.success) {
    return {
      valid: false,
      errors: getErrors(validationResult),
    };
  }

  const result = await signUp(event);

  return {
    valid: true,
    data: result,
  };
};
