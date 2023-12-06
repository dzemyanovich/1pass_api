import { getUserId } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { deleteFirebaseToken } from '../utils/firebase';
import { getErrors, validateFirebaseRequest } from '../utils/validation';

// todo: change return type to SignOutResponse
export async function handler(event: FirebaseRequest): Promise<FirebaseResponse> {
  const validationResult = validateFirebaseRequest(event);
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

  await deleteFirebaseToken(userId, firebaseToken);

  return {
    success: true,
  };
}
