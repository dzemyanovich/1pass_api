const { database } = require('./config/config');
const { runSql } = require('./utils/utils');

runSql(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
