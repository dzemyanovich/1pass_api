import { getSportObjects } from './db/utils/repository';
import { toSportObject } from './db/utils/view-models';

export async function handler(): Promise<EventResult<SportObjectVM[]>> {
  const executionResult = await getSportObjects();

  return executionResult.error
    ? {
      success: false,
      errors: [ executionResult.error ],
    }
    : {
      success: true,
      data: (executionResult.data as SportObjectDM[]).map((m: SportObjectDM) => toSportObject(m))
    };
};
