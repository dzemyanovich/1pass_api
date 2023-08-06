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

  const sendStatus = await sendCode(event);

  if (sendStatus !== 'pending') {
    return {
      valid: false,
      errors: [
        `send code status is ${sendStatus}`
      ],
    };
  }

  return {
    valid: true,
  };
};
