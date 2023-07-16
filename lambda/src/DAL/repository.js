const mysql = require('mysql2');

const { username, password, database, host } = require('../db/config/config');

module.exports = {
  getSportObjects,
};

async function getSportObjects() {
  const connection = mysql.createConnection({
    host: host,
    user: username,
    password: password,
  });

  // todo: use sequelize
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
