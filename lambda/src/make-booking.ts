import { getErrors, validateMakeBooking } from './utils/validation';

export async function handler(event: MakeBookingEvent): Promise<EventResult<void>> {
  const validationResult = validateMakeBooking(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  throw new Error('not implemented');
}
