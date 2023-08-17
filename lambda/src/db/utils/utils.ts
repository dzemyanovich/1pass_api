import mysql from 'mysql2';

import config from '../config/config';

const { username, password, host } = config;

export function runSql(sql: string): void {
  const connection = mysql.createConnection({
    host,
    user: username,
    password,
  });

  connection.query(
    sql,
    (err, results) => {
      // eslint-disable-next-line no-console
      console.log(results);
      // eslint-disable-next-line no-console
      console.log(err);
    },
  );

  connection.end();
}

export const TEST_ADMIN_PREFIX = 'test_admin_';
export const TEST_ADMIN_PASSWORD = 'admin_password';

export function getTestAdminName(index: number): string {
  return `${TEST_ADMIN_PREFIX}${index}`;
}
