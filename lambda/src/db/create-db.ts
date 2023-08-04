import config from './config/config';
import { runSql } from './utils/utils';

const { database } = config;

runSql(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
