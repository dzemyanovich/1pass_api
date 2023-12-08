import { getUserId } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { getErrors, validateSignOutRequest } from '../utils/validation';
import { publishMessage } from '../utils/sns';

export async function handler(event: SignOutRequest): Promise<EmptyResponse> {
  const validationResult = validateSignOutRequest(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { firebaseToken, userToken } = event;

  const userId = getUserId(userToken);
  if (!userId) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  await publishMessage({
    userId,
    firebaseToken,
  }, 'delete-firebase-token');

  return {
    success: true,
  };
}
