'use strict';

import { getHash } from '../../utils/auth';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any, Sequelize: any) {
    return queryInterface.bulkInsert('Users', [{
      phone: '+375333333333',
      firstName: 'test_name_1',
      lastName: 'test_last_name_1',
      email: 'test_email_1@mail.ru',
      password: getHash('test_password_1'),
      verified: true,
    },
    {
      phone: '+375333333334',
      verified: false,
    },
    {
      phone: '+375333333335',
      verified: true,
    }]);
  },

  async down(queryInterface: any, Sequelize: any) {
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(
      'Users',
      { [Op.or]: [{ phone: '112' }, { phone: '113' }] }
    );
  }
};
