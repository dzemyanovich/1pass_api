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

  return executionResult.error
    ? {
      success: false,
      errors: [executionResult.error]
    }
    : {
      success: true,
      data: executionResult.data as string,
    };
};
