const { database } = require('./config/config');
const { runSql } = require('./utils/utils');

runSql(`DROP DATABASE IF EXISTS ${database}`);
