import ENVS from '../enums/envs';

const config: DBConfig = getConfig();

export default config;
// required for sequilize
module.exports = config;

function getConfig(): DBConfig {
  switch (getEnv()) {
    case ENVS.dev:
      require('./env-vars');

      return {
        username: process.env.DEV_DB_USERNAME,
        password: process.env.DEV_DB_PASSWORD,
        database: process.env.DEV_DB_NAME,
        host: process.env.DEV_DB_HOST,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    case ENVS.preprod:
      return {
        username: process.env.PREPROD_DB_USERNAME,
        password: process.env.PREPROD_DB_PASSWORD,
        database: process.env.PREPROD_DB_NAME,
        host: process.env.PREPROD_DB_HOST,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    case ENVS.prod:
      return {
        username: process.env.PROD_DB_USERNAME,
        password: process.env.PROD_DB_PASSWORD,
        database: process.env.PROD_DB_NAME,
        host: process.env.PROD_DB_HOST,
        dialect: 'mysql',
        seederStorage: 'sequelize',
      };
    default:
      throw new Error('env not supported');
  }
}

function isDev(): boolean {
  return process.env.NODE_ENV.startsWith(ENVS.dev);
}

function isPreprod(): boolean {
  return process.env.NODE_ENV.startsWith(ENVS.preprod);
}

function isProd(): boolean {
  return process.env.NODE_ENV.startsWith(ENVS.prod);
}

function getEnv(): string {
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
