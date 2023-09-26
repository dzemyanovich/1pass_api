import { getTokenData } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { storeToken } from '../utils/firebase';
import { getErrors, validateFirebaseRequest } from '../utils/validation';

export async function handler(event: FirebaseRequest): Promise<FirebaseResponse> {
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

  await storeToken(tokenData, firebaseToken);

  return {
    success: true,
  };
}
