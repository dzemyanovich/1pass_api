import { getUser, signUp } from './db/utils/repository';
import { getErrors, validateSignUp } from './utils/validation';

export async function handler(event: SignUpEvent): Promise<EventResult<UserDM>> {
  const validationResult = validateSignUp(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { phone } = event;
  const user = await getUser(phone);

  if (user) {
    if (user.password) {
      return {
        success: false,
        errors: [`user with phone = ${phone} already exists`],
      };
    }
    if (!user.verified) {
      return {
        success: false,
        errors: [`phone ${phone} is not verified`],
      };
    }
  }

  const result = await signUp(event);

  return {
    success: true,
    data: result,
  };
};
