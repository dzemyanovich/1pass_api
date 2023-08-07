import ENVS from '../enums/envs';

const config: DBConfig = getConfig();

export default config;
// required for sequilize
module.exports = config;

function getConfig(): DBConfig {
  switch (getEnv()) {
    case ENVS.dev:
    case ENVS.test:
      require('./env-vars');

      return {
        username: process.env.DEV_DB_USERNAME as string,
        password: process.env.DEV_DB_PASSWORD as string,
        database: process.env.DEV_DB_NAME as string,
        host: process.env.DEV_DB_HOST as string,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    case ENVS.preprod:
      return {
        username: process.env.PREPROD_DB_USERNAME as string,
        password: process.env.PREPROD_DB_PASSWORD as string,
        database: process.env.PREPROD_DB_NAME as string,
        host: process.env.PREPROD_DB_HOST as string,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    case ENVS.prod:
      return {
        username: process.env.PROD_DB_USERNAME as string,
        password: process.env.PROD_DB_PASSWORD as string,
        database: process.env.PROD_DB_NAME as string,
        host: process.env.PROD_DB_HOST as string,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    default:
      throw new Error('env not supported');
  }
}

function getEnv(): string {
  if (!process.env.NODE_ENV) {
    throw new Error(`process.env.NODE_ENV is not set`);
  }
  if (process.env.NODE_ENV.startsWith(ENVS.dev)) {
    return ENVS.dev;
  }
  if (process.env.NODE_ENV.startsWith(ENVS.test)) {
    return ENVS.test;
  }
  if (process.env.NODE_ENV.startsWith(ENVS.preprod)) {
    return ENVS.preprod;
  }
  if (process.env.NODE_ENV.startsWith(ENVS.prod)) {
    return ENVS.prod;
  }
  throw new Error(`process.env.NODE_ENV = ${process.env.NODE_ENV} is not recognized`);
}
