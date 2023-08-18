import { getAdminById, getBookings } from '../db/utils/repository';
import { toBooking } from '../db/utils/view-models';
import { getAdminId } from '../utils/auth';
import { invalidToken } from '../utils/errors';
import { getErrors, validateTokenEvent } from '../utils/validation';

// todo: delete validate-token api endpoint, use this endpoint instead
export async function handler(event: TokenEvent): Promise<EventResult<BookingVM[]>> {
  const validationResult = validateTokenEvent(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token } = event;
  const adminId = getAdminId(token);

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
    data: bookings.map(toBooking), // todo: update BookingVM to include Sport Object and User models
  };
}
