import { getSportObjects } from './db/utils/repository';
import { toSportObject } from './db/utils/view-models';

export async function handler(): Promise<SportObjectVM[]> {
  const sportObjects: SportObjectDM[] = await getSportObjects();
  return sportObjects.map((m: SportObjectDM) => toSportObject(m));
}
