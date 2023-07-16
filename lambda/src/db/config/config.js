const ENVS = require('../enums/envs');

switch (getEnv()) {
  case ENVS.dev:
    require('./env-vars');

    module.exports = {
      username: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: process.env.DEV_DB_HOST,
      dialect: 'mysql',
      seederStorage: 'sequelize',
    };
    break;
  case ENVS.preprod:
    module.exports = {
      username: process.env.PREPROD_DB_USERNAME,
      password: process.env.PREPROD_DB_PASSWORD,
      database: process.env.PREPROD_DB_NAME,
      host: process.env.PREPROD_DB_HOST,
      dialect: 'mysql',
      seederStorage: 'sequelize',
    };
    break;
  case ENVS.prod:
    module.exports = {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOST,
      dialect: 'mysql',
      seederStorage: 'sequelize',
    };
    break;
  default:
    throw new Error('env not supported');
}

function isDev() {
  return process.env.NODE_ENV.startsWith(ENVS.dev);
}

function isPreprod() {
  return process.env.NODE_ENV.startsWith(ENVS.preprod);
}

function isProd() {
  return process.env.NODE_ENV.startsWith(ENVS.prod);
}

function getEnv() {
  if (isDev()) {
    return ENVS.dev;
  }
  if ((isPreprod())) {
    return ENVS.preprod;
  }
  if (isProd()) {
    return ENVS.prod;
  }
  throw new Error(`process.env.NODE_ENV = ${process.env.NODE_ENV} is not recognized`);
}
