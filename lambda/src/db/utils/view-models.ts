export function toSportObject(sportObject: SportObjectDM): SportObjectVM {
  const { id, name, address, lat, long } = sportObject;

  return {
    id,
    name,
    address,
    lat,
    long,
  };
}
