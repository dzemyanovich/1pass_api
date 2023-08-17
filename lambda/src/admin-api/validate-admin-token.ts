import { getAdminById } from '../db/utils/repository';
import { getAdminId } from '../utils/auth';
import { getErrors, validateTokenEvent } from '../utils/validation';

export async function handler(event: TokenEvent): Promise<EventResult<void>> {
  const validationResult = validateTokenEvent(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const { token } = event;
  const adminId = getAdminId(token);

  if (!adminId) {
    return {
      success: false,
    };
  }

  const admin = await getAdminById(adminId);

  return {
    success: !!admin,
  };
}
