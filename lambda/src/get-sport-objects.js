const mysql = require('mysql2');

const { getSportObjects } = require('./DAL/repository');
const { toSportObject } = require('./utils/view-models');

module.exports = {
  handler,
};

async function handler() {
  const sportObjects = await getSportObjects();

  return sportObjects.map(m => toSportObject(m));
};
