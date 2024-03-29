import { getUserByPhone, getUserByEmail, signUp } from '../db/utils/repository';
import { getToken, getTokenData } from '../utils/auth';
import { emailExists, phoneNotVerified, userExists, userNotFound } from '../utils/errors';
import { publishMessage } from '../utils/sns';
import { getErrors, validateSignUp } from '../utils/validation';

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

  const token = getToken(userByPhone.id as number);
  const tokenData = getTokenData(token);
  const { firstName, lastName, firebaseToken } = event;

  await publishMessage({
    tokenData,
    firebaseToken,
  }, 'register-firebase-token');

  return {
    success: true,
    data: {
      token,
      userInfo: {
        phone,
        email,
        firstName,
        lastName,
      },
    },
  };
}
