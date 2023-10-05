import { QueryInterface, Op } from 'sequelize';

import SportObject from '../models/sport-object';
import testSportObjects from '../utils/test-data/test-sport-objects';
import { getTestSportObjects } from '../utils/repository';

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    return queryInterface.bulkInsert('SportObjects', testSportObjects);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    const sportObjects = await getTestSportObjects();
    const sportObjectIds = sportObjects.map((sportObject: SportObject) => sportObject.id as number);

    await queryInterface.bulkDelete(
      'Bookings',
      {
        sportObjectId: {
          [Op.in]: sportObjectIds,
        },
      },
    );

    return queryInterface.bulkDelete(
      'SportObjects',
      {
        id: {
          [Op.in]: sportObjectIds,
        },
      },
    );
  },
};
