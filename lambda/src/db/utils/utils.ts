import mysql from 'mysql2';

import config from '../config/config';

const { username, password, host } = config;

export function runSql(sql: string): void {
  const connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
  });

  connection.query(
    sql,
    function (err, results) {
      console.log(results);
      console.log(err);
    }
  );

  connection.end();
}
