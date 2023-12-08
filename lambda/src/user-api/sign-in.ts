import { getUserBookings, signIn } from '../db/utils/repository';
import { toUserBooking, toUserInfo } from '../db/utils/view-models';
import { getToken, getTokenData } from '../utils/auth';
import { invalidCredentials } from '../utils/errors';
import { publishMessage } from '../utils/sns';
import { getErrors, validateSignIn } from '../utils/validation';

export async function handler(event: SignInRequest): Promise<SignInResponse> {
  const validationResult = validateSignIn(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const user = await signIn(event);

  if (!user) {
    return {
      success: false,
      errors: [invalidCredentials()],
    };
  }

  const userInfo: UserInfo = toUserInfo(user);
  const bookings: UserBooking[] = (await getUserBookings(user.id as number)).map(toUserBooking);

  const token = getToken(user.id as number);
  const tokenData = getTokenData(token);
  const { firebaseToken } = event;

  await publishMessage({
    tokenData,
    firebaseToken,
  }, 'register-firebase-token');

  return {
    success: true,
    data: {
      token,
      userInfo,
      bookings,
    },
  };
}
