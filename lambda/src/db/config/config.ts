import { SequelizeOptions } from 'sequelize-typescript';

import ENVS from '../utils/envs';

const config: SequelizeOptions = getConfig();

export default config;
// required for sequilize
module.exports = config;

function getConfig(): SequelizeOptions {
  const configBase = {
    dialect: 'mysql',
    models: [`${__dirname}/../models/`],
  };
  const env = getEnv();

  switch (env) {
    case ENVS.dev:
    case ENVS.test:
      // eslint-disable-next-line global-require
      require('./env-vars');

      return {
        username: process.env.DEV_DB_USERNAME as string,
        password: process.env.DEV_DB_PASSWORD as string,
        database: process.env.DEV_DB_NAME as string,
        host: process.env.DEV_DB_HOST as string,
        ...configBase,
      } as SequelizeOptions;
    case ENVS.preprod:
      return {
        username: process.env.PREPROD_DB_USERNAME as string,
        password: process.env.PREPROD_DB_PASSWORD as string,
        database: process.env.PREPROD_DB_NAME as string,
        host: process.env.PREPROD_DB_HOST as string,
        ...configBase,
      } as SequelizeOptions;
    case ENVS.prod:
      return {
        username: process.env.PROD_DB_USERNAME as string,
        password: process.env.PROD_DB_PASSWORD as string,
        database: process.env.PROD_DB_NAME as string,
        host: process.env.PROD_DB_HOST as string,
        ...configBase,
      } as SequelizeOptions;
    default:
      throw new Error(`env ${env} not supported`);
  }
}

function getEnv(): string {
  if (process.env.NODE_ENV?.startsWith(ENVS.dev)) {
    return ENVS.dev;
  }
  if (process.env.NODE_ENV?.startsWith(ENVS.test)) {
    return ENVS.test;
  }
  if (process.env.NODE_ENV?.startsWith(ENVS.preprod)) {
    return ENVS.preprod;
  }
  if (process.env.NODE_ENV?.startsWith(ENVS.prod)) {
    return ENVS.prod;
  }
  throw new Error(`process.env.NODE_ENV = ${process.env.NODE_ENV} is not recognized`);
}
