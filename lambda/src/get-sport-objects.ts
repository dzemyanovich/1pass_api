import * as dbModels from './db/models';
import { toSportObject } from './db/utils/view-models';

const { SportObject } = dbModels as unknown as DBModels;

export async function handler(): Promise<SportObjectVM[]> {
  const sportObjects: SportObjectDM[] = await SportObject.findAll();

  return sportObjects.map((m: SportObjectDM) => toSportObject(m));
};
