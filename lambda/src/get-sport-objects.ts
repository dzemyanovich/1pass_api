import * as dbModels from './db/models';
import { toSportObject } from './db/utils/view-models';

const { SportObject } = dbModels;

export async function handler() {
  const sportObjects = await SportObject.findAll();

  return sportObjects.map(m => toSportObject(m));
};
