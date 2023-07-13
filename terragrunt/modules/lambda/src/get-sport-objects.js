const mysql = require('mysql2');

const { username, password, database, host } = require('./config');

module.exports = {
  handler,
};

async function handler() {
  const connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
  });

  const sportObjects = await runQuery(connection, `SELECT * FROM ${database}.SportObjects;`);

  connection.end();

  return sportObjects;
};

function runQuery(connection, query) {
  return new Promise((resolve, reject) => {
    connection.query(
      query,
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}
