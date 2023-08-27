import Booking from '../db/models/booking';
import { confirmVisit, getAdminById, getBookingById } from '../db/utils/repository';
import { getAdminId } from '../utils/auth';
import { invalidToken, noBooking, noBookingAccess, pastBooking, updateError } from '../utils/errors';
import { isPastBooking } from '../utils/utils';
import { getErrors, validateConfirmVisit } from '../utils/validation';

export async function handler(event: ConfirmVisitRequest): Promise<ConfirmVisitResponse> {
  const validationResult = validateConfirmVisit(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { bookingId, token } = event;
  const adminId = getAdminId(token);
  if (!adminId) {
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

  const admin = await getAdminById(adminId);
  if (admin.sportObjectId !== booking.sportObjectId) {
    return {
      success: false,
      errors: [noBookingAccess()],
    };
  }

  if (isPastBooking(booking)) {
    return {
      success: false,
      errors: [pastBooking()],
    };
  }

  // todo: add e2e / integration tests which check return value (visit time)
  const affectedRows = await confirmVisit(bookingId);
  if (affectedRows.length !== 1 || affectedRows[0] !== 1) {
    return {
      success: false,
      errors: [updateError()],
    };
  }

  const { visitTime } = await getBookingById(bookingId) as Booking;

  return {
    success: true,
    data: visitTime,
  };
}
