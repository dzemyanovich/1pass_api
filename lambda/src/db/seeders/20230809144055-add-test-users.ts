'use strict';

import testUsers from '../utils/test-users';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    return queryInterface.bulkInsert('Users', testUsers);
  },

  async down(queryInterface: any, Sequelize: any) {
    const Op = Sequelize.Op;
    const where: { phone: string }[] = []
    testUsers.forEach(({ phone }) => where.push({ phone }));

    return queryInterface.bulkDelete(
      'Users',
      { [Op.or]: where }
    );
  }
};
