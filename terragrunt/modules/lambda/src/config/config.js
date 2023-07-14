const { getEnv } = require('../utils/utils');
const ENVS = require('../enums/envs');

switch (getEnv()) {
  case ENVS.dev:
    require('./env-vars');

    module.exports = {
      username: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: process.env.DEV_DB_HOST,
    };
    break;
  case ENVS.preprod:
    module.exports = {
      username: process.env.PREPROD_DB_USERNAME,
      password: process.env.PREPROD_DB_PASSWORD,
      database: process.env.PREPROD_DB_NAME,
      host: process.env.PREPROD_DB_HOST,
    };
    break;
  case ENVS.prod:
    module.exports = {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOST,
    };
    break;
  default:
    throw new Error('env not supported');
}
