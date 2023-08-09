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
      console.log(results);
      console.log(err);
    },
  );

  connection.end();
}
