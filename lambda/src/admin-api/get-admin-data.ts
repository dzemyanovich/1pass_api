import { getBookings, getFullAdmin } from '../db/utils/repository';
import { toAdminBooking, toSportObject } from '../db/utils/view-models';
import { getAdminId } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { getErrors, validateTokenEvent } from '../utils/validation';

export async function handler({ querystring }: GetRequest<TokenEvent>): Promise<AdminDataResponse> {
  const validationResult = validateTokenEvent(querystring);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token } = querystring;
  const adminId = getAdminId(token) as number;

  if (!adminId) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  const admin = await getFullAdmin(adminId);
  const bookings = await getBookings(adminId);

  return {
    success: true,
    data: {
      username: admin.username,
      sportObject: toSportObject(admin.sportObject),
      bookings: bookings.map(toAdminBooking),
    },
  };
}
