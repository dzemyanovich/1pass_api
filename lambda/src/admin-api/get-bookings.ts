import { getAdminById, getBookings } from '../db/utils/repository';
import { toAdminBooking } from '../db/utils/view-models';
import { getAdminId } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { getErrors, validateTokenEvent } from '../utils/validation';

export async function handler({ querystring }: GetRequest<TokenEvent>): Promise<EventResult<AdminBooking[]>> {
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

  // todo: make only 1 SQL request
  const { sportObjectId } = await getAdminById(adminId);
  const bookings = await getBookings(sportObjectId);

  return {
    success: true,
    data: bookings.map(toAdminBooking),
  };
}
