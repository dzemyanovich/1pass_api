import SportObject from '../db/models/sport-object';
import { getSportObjects, getUserBookings, getUserById } from '../db/utils/repository';
import { toUserBooking, toSportObject, toUserInfo } from '../db/utils/view-models';
import { getUserId } from '../utils/auth';
import { getErrors, validateTokenRequest } from '../utils/validation';

export async function handler({ querystring }: GetRequest<TokenRequest>): Promise<UserDataResponse> {
  const { token } = querystring;
  let bookings: UserBooking[] | null = null;
  let userInfo: UserInfo | null = null;

  if (token) {
    const validationResult = validateTokenRequest(querystring);
    if (!validationResult.success) {
      return {
        success: false,
        errors: getErrors(validationResult),
      };
    }

    const userId = getUserId(token);

    if (userId) {
      const user = await getUserById(userId);

      if (user) {
        userInfo = toUserInfo(user);
        bookings = (await getUserBookings(userId)).map(toUserBooking);
      }
    }
  }

  const sportObjects: SportObject[] = await getSportObjects();

  return {
    success: true,
    data: {
      sportObjects: sportObjects.map(toSportObject),
      bookings,
      userInfo,
    },
  };
}
