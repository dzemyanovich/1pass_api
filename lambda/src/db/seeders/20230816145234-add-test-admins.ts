import { QueryInterface, Op } from 'sequelize';
import { getSportObjects } from '../utils/repository';
import SportObject from '../models/sport-object';
import Admin from '../models/admin';
import { getHash } from '../../utils/auth';

const TEST_ADMIN_PREFIX = 'test_admin_';

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    const sportObjects = await getSportObjects();
    const admins: Admin[] = sportObjects.map((sportObject: SportObject, index: number) => ({
      username: `${TEST_ADMIN_PREFIX}${index}`,
      password: getHash(`admin_password_${index}`),
      sportObjectId: sportObject.id,
    }) as Admin);

    return queryInterface.bulkInsert('Admins', admins);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    return queryInterface.bulkDelete(
      'Admins',
      { username: { [Op.like]: `${TEST_ADMIN_PREFIX}%` } },
    );
  },
};
