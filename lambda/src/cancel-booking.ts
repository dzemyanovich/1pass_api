import { deleteBooking, getBookingById } from './db/utils/repository';
import { getUserId } from './utils/auth';
import { invalidToken, noBooking, noBookingCancel } from './utils/errors';
import { isToday } from './utils/utils';
import { getErrors, validateCancelBooking } from './utils/validation';

export async function handler(event: CancelBookingEvent): Promise<EventResult<void>> {
  const validationResult = validateCancelBooking(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token, bookingId } = event;

  const userId = getUserId(token);
  if (!userId) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    return {
      success: false,
      errors: [noBooking()],
    };
  }

  if (!isToday(booking.bookingTime) || booking.visitTime) {
    return {
      success: false,
      errors: [noBookingCancel()],
    };
  }

  await deleteBooking(bookingId);

  return {
    success: true,
  };
}
