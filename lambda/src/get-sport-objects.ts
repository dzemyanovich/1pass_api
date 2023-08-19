import SportObject from './db/models/sport-object';
import { getSportObjects } from './db/utils/repository';
import { toSportObject } from './db/utils/view-models';
import { getUserId } from './utils/auth';
import { invalidToken } from './utils/errors';
import { getErrors, validateTokenEvent } from './utils/validation';

// todo: change to get-initial-data
export async function handler(
  { queryStringParameters }: GetRequest<TokenEvent>,
): Promise<EventResult<SportObjectVM[]>> {
  const { token } = queryStringParameters;

  if (token) {
    const validationResult = validateTokenEvent(queryStringParameters);
    if (!validationResult.success) {
      return {
        success: false,
        errors: getErrors(validationResult),
      };
    }

    const userId = getUserId(token);

    if (!userId) {
      return {
        success: false,
        errors: [invalidToken()],
      };
    }

    // todo: get past bookings
    // todo: get user info
  }

  const sportObjects: SportObject[] = await getSportObjects();
  return {
    success: true,
    data: sportObjects.map(toSportObject),
  };
}
