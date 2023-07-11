const Sequelize = require('sequelize');
const mysql = require('mysql2');

require('./env-vars');

const { db_username, db_password, db_host, db_name } = process.env;

createSchema();
connectDb();

function createSchema() {
  const connection = mysql.createConnection({
    host: db_host,
    user: db_username,
    password: db_password,
  });

  connection.query(
    `CREATE DATABASE IF NOT EXISTS ${db_name}`,
    function (err, results) {
      console.log(results);
      console.log(err);
    }
  );

  connection.end();
}

function connectDb() {
  const sequelize = new Sequelize(db_name, db_username, db_password, {
    host: db_host,
    dialect: 'mysql',
    port: '3306',
  });

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
}
