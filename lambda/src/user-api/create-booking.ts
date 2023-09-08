import Booking from '../db/models/booking';
import { createBooking, getFullBooking, getSportObjectById, getTodayBooking } from '../db/utils/repository';
import { toUserBooking } from '../db/utils/view-models';
import { getUserId } from '../utils/auth';
import { alreadyBooked, invalidToken, noSportObject } from '../utils/errors';
import { getErrors, validateCreateBooking } from '../utils/validation';

export async function handler(event: CreateBookingRequest): Promise<CreateBookingResponse> {
  const validationResult = validateCreateBooking(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token, sportObjectId } = event;

  const userId = getUserId(token);
  if (!userId) {
    return {
      success: false,
      errors: [invalidToken()],
    };
  }

  const sportObject = await getSportObjectById(sportObjectId);
  if (!sportObject) {
    return {
      success: false,
      errors: [noSportObject()],
    };
  }

  const todayBooking = await getTodayBooking(userId, sportObjectId);
  if (todayBooking) {
    return {
      success: false,
      errors: [alreadyBooked()],
    };
  }

  // create request does not return nested objects
  const booking = await createBooking(userId, sportObjectId);
  const fullBooking = await getFullBooking(booking.id as number);

  return {
    success: true,
    data: toUserBooking(fullBooking as Booking),
  };
}
