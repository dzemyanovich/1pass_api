import SportObject from '../models/sport-object';

export function toSportObject(sportObject: SportObject): SportObjectVM {
  const { id, name, address, lat, long } = sportObject;

  return {
    id,
    name,
    address,
    lat,
    long,
  };
}
