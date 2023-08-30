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
