// const { getSportObjects } = require('./DAL/repository');
const { toSportObject } = require('./db/utils/view-models');
const SportObject = require('./db/models/sportobject');

module.exports = {
  handler,
};

async function handler() {
  const sportObjects = await SportObject.findAll();
  // const sportObjects = await getSportObjects();

  return sportObjects.map(m => toSportObject(m));
};
