import { adminSignIn, getBookings } from '../db/utils/repository';
import { toAdminBooking, toSportObject } from '../db/utils/view-models';
import { getAdminToken } from '../utils/auth';
import { userNotFound } from '../utils/errors';
import { getErrors, validateAdminSignIn } from '../utils/validation';

export async function handler(event: AdminSignInEvent): Promise<EventResult<AdminSignInResult>> {
  const validationResult = validateAdminSignIn(event);
  if (!validationResult.success) {
    return {
      success: false,
      errors: getErrors(validationResult),
    };
  }

  const admin = await adminSignIn(event);

  if (!admin) {
    return {
      success: false,
      errors: [userNotFound()],
    }
  }

  const adminId = admin.id as number;

  const token = getAdminToken(adminId);
  const bookings = await getBookings(adminId);

  return {
    success: true,
    data: {
      token,
      username: admin.username,
      sportObject: toSportObject(admin.sportObject),
      bookings: bookings.map(toAdminBooking),
    },
  };
}
