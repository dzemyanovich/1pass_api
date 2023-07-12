'use strict';

const env = process.env.NODE_ENV || 'dev';
const { database } = require(__dirname + '/../config/config.json')[env];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DROP DATABASE IF EXISTS ${database}`);
  }
};
