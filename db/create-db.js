const mysql = require('mysql2');

require('./env-vars');

const { db_username, db_password, db_host, db_name } = process.env;

module.exports = {
  up: async () => {
    runSql(`CREATE DATABASE IF NOT EXISTS ${db_name}`);
  },
  down: async () => {
    runSql(`DROP DATABASE IF EXISTS ${db_name}`);
  },
};

function runSql(sql) {
  const connection = mysql.createConnection({
    host: db_host,
    user: db_username,
    password: db_password,
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
