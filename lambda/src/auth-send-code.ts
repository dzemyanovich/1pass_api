import { sendCode } from './utils/auth';
import { getErrors, validateSendCode } from './utils/validation';

export async function handler(event: SendCodeEvent): Promise<EventResult<string>> {
  const validationResult = validateSendCode(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const executionResult = await sendCode(event);
  const { errors, data } = executionResult;

  return errors.length
    ? {
      success: false,
      errors,
    }
    : {
      success: true,
      data: data as string,
    };
};
