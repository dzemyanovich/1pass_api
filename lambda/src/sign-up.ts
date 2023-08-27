import { getUserByPhone, getUserByEmail, signUp } from './db/utils/repository';
import { getToken } from './utils/auth';
import { emailExists, phoneNotVerified, userExists, userNotFound } from './utils/errors';
import { getErrors, validateSignUp } from './utils/validation';

export async function handler(event: SignUpRequest): Promise<SignUpResponse> {
  const validationResult = validateSignUp(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { phone } = event;
  const userByPhone = await getUserByPhone(phone);

  if (!userByPhone) {
    return {
      success: false,
      errors: [userNotFound()],
    };
  }

  if (userByPhone.password) {
    return {
      success: false,
      errors: [userExists(phone)],
    };
  }

  if (!userByPhone.verified) {
    return {
      success: false,
      errors: [phoneNotVerified(phone)],
    };
  }

  const { email } = event;
  const userByEmail = await getUserByEmail(email);
  if (userByEmail) {
    return {
      success: false,
      errors: [emailExists(email)],
    };
  }

  await signUp(event);

  return {
    success: true,
    data: getToken(userByPhone.id as number),
  };
}
