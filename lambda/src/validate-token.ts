import { getUserById } from './db/utils/repository';
import { validateToken } from './utils/auth';
import { getErrors, validateTokenEvent } from './utils/validation';

export async function handler(event: ValidateTokenEvent): Promise<EventResult<void>> {
  const validationResult = validateTokenEvent(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token } = event;
  const userId = validateToken(token);

  if (!userId) {
    return {
      success: false,
    };
  }

  const user = await getUserById(userId);

  return {
    success: !!user && !!user.password,
  };
}
