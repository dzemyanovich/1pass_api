import { sendCode } from './utils/auth';
import { getErrors, validateSendCode } from './utils/validation';

export async function handler(event: SendCodeEvent): Promise<EventResult<string>> {
  const validationResult = validateSendCode(event);
  if (!validationResult.success) {
    return {
      valid: false,
      errors: getErrors(validationResult),
    };
  }

  const result = await sendCode(event);

  return {
    valid: true,
    data: result,
  };
};
