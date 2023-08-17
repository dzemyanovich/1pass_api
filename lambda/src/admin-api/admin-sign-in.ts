import { adminSignIn } from '../db/utils/repository';
import { getAdminToken } from '../utils/auth';
import { userNotFound } from '../utils/errors';
import { getErrors, validateAdminSignIn } from '../utils/validation';

export async function handler(event: AdminSignInEvent): Promise<EventResult<string>> {
  const validationResult = validateAdminSignIn(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const admin = await adminSignIn(event);

  return admin
    ? {
      success: true,
      data: getAdminToken(admin.id as number),
    }
    : {
      success: false,
      errors: [userNotFound()],
    };
}
