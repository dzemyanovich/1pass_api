import { getUser, signUp } from './db/utils/repository';
import { phoneNotVerified, userExists, userNotFound } from './utils/errors';
import { getErrors, validateSignUp } from './utils/validation';

export async function handler(event: SignUpEvent): Promise<EventResult<void>> {
  const validationResult = validateSignUp(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { phone } = event;
  const user = await getUser(phone);

  if (!user) {
    return {
      success: false,
      errors: [userNotFound()],
    };
  }

  if (user.password) {
    return {
      success: false,
      errors: [userExists(phone)],
    };
  }
  if (!user.verified) {
    return {
      success: false,
      errors: [phoneNotVerified(phone)],
    };
  }

  const result = await signUp(event);

  return {
    success: true,
  };
};
