import { getTokenData } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { storeFirebaseToken } from '../utils/firebase';
import { getErrors, validateFirebaseRequest } from '../utils/validation';

export async function handler(event: FirebaseRequest): Promise<EmptyResponse> {
  const validationResult = validateFirebaseRequest(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { firebaseToken, userToken } = event;

  const tokenData = getTokenData(userToken);
  if (!tokenData) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  await storeFirebaseToken(tokenData, firebaseToken);

  return {
    success: true,
  };
}
