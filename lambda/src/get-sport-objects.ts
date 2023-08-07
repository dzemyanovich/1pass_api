import { getSportObjects } from './db/utils/repository';
import { toSportObject } from './db/utils/view-models';

export async function handler(): Promise<EventResult<SportObjectVM[]>> {
  const executionResult = await getSportObjects();
  const { errors, data } = executionResult;

  return errors.length
    ? {
      success: false,
      errors,
    }
    : {
      success: true,
      data: (data as SportObjectDM[]).map((m: SportObjectDM) => toSportObject(m))
    };
};
