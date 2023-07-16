const mysql = require('mysql2');

const { username, password, host } = require('../config/config');

module.exports = {
  runSql,
}

function runSql(sql) {
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

