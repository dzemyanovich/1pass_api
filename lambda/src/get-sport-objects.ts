import SportObject from './db/models/sport-object';
import { getSportObjects } from './db/utils/repository';
import { toSportObject } from './db/utils/view-models';

export async function handler(): Promise<SportObjectVM[]> {
  const sportObjects: SportObject[] = await getSportObjects();
  return sportObjects.map(toSportObject);
}
