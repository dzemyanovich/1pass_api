module.exports = {
  toSportObject,
};

function toSportObject(sportObject) {
  const { id, name, address, lat, long } = sportObject;

  return {
    id,
    name,
    address,
    lat,
    long,
  };
}
