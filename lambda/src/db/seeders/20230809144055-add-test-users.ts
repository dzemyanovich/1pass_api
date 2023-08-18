import { QueryInterface, Op } from 'sequelize';

import { testUsers } from '../utils/test-users';

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    return queryInterface.bulkInsert('Users', testUsers);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    const where: { phone: string }[] = [];
    testUsers.forEach(({ phone }) => where.push({ phone }));

    return queryInterface.bulkDelete(
      'Users',
      { [Op.or]: where },
    );
  },
};
