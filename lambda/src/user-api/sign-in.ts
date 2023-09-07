import { getUserBookings, signIn } from '../db/utils/repository';
import { toUserBooking, toUserInfo } from '../db/utils/view-models';
import { getToken } from '../utils/auth';
import { invalidCredentials } from '../utils/errors';
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

  return {
    success: true,
    data: {
      token: getToken(user.id as number),
      userInfo,
      bookings,
    },
  };
}
