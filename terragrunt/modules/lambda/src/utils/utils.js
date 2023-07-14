const ENVS = require('../enums/envs');

module.exports = {
  getEnv,
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
