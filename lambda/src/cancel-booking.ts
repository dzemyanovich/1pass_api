import { getErrors, validateCancelBooking } from './utils/validation';

export async function handler(event: CancelBookingEvent): Promise<EventResult<void>> {
  const validationResult = validateCancelBooking(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  throw new Error('not implemented');
}
