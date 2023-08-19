import SportObject from './db/models/sport-object';
import { getSportObjects, getUserBookings, getUserById } from './db/utils/repository';
import { toBooking, toSportObject } from './db/utils/view-models';
import { getUserId } from './utils/auth';
import { invalidToken } from './utils/errors';
import { getErrors, validateTokenEvent } from './utils/validation';

export async function handler(
  { queryStringParameters }: GetRequest<TokenEvent>,
): Promise<EventResult<UserData>> {
  const { token } = queryStringParameters;
  let bookings: BookingVM[] | null = null;
  let userInfo: UserInfo | null = null;

  if (token) {
    const validationResult = validateTokenEvent(queryStringParameters);
    if (!validationResult.success) {
      return {
        success: false,
        errors: getErrors(validationResult),
      };
    }

    const userId = getUserId(token);

    if (!userId) {
      return {
        success: false,
        errors: [invalidToken()],
      };
    }

    bookings = (await getUserBookings(userId)).map(toBooking)

    const { firstName, lastName, phone, email } = await getUserById(userId);
    userInfo = {
      firstName,
      lastName,
      phone,
      email,
    }
  }

  const sportObjects: SportObject[] = await getSportObjects();
 
  return {
    success: true,
    data: {
      sportObjects: sportObjects.map(toSportObject),
      bookings,
      userInfo,
    }
  };
}
