const { SportObject } = require('./db/models');
const { toSportObject } = require('./db/utils/view-models');

module.exports = {
  handler,
};

async function handler() {
  const sportObjects = await SportObject.findAll();

  return sportObjects.map(m => toSportObject(m));
};
