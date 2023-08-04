import config from './config/config';
import { runSql } from './utils/utils';

const { database } = config;

runSql(`DROP DATABASE IF EXISTS ${database}`);
