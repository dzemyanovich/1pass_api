const mysql = require('mysql2');
const config = require('./config/config');

const { username, password, database, host } = config[process.env.NODE_ENV];

createDb();

function createDb() {
  const connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
  });

  connection.query(
    `CREATE DATABASE IF NOT EXISTS ${database}`,
    function (err, results) {
      console.log(results);
      console.log(err);
    }
  );

  connection.end();
}
