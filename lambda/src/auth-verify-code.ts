import { sendCode } from './utils/auth';
import { getErrors, validateVerifyCode } from './utils/validation';

export async function handler(event: VerifyCodeEvent): Promise<EventResult<string>> {
  const validationResult = validateVerifyCode(event);
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
