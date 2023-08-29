import { createBooking, getSportObjectById, getTodayBooking } from '../db/utils/repository';
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

  const booking = await createBooking(userId, sportObjectId);

  return {
    success: true,
    data: booking.id,
  };
}
