const config = require('./config/config');
const { runSql } = require('./utils');

const { database } = config[process.env.NODE_ENV];

runSql(`DROP DATABASE IF EXISTS ${database}`);
