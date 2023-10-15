import { QueryInterface, Op } from 'sequelize';

import SportObject from '../models/sport-object';
import testSportObjectImages from '../utils/test-data/test-sport-object-images';
import { getTestSportObjects } from '../utils/repository';
import SportObjectImage from '../models/sport-object-image';

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    const sportObjects = await getTestSportObjects();
    const sportObjectImages: SportObjectImage[] = [];

    Object.keys(testSportObjectImages).forEach((sportObjectName: string) => {
      const sportObject = sportObjects.find((item: SportObject) => item.name === sportObjectName);
      if (!sportObject) {
        throw new Error(`sport object with name = ${sportObjectName} is not found`);
      }
      const sportObjectId = sportObject.id;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      (testSportObjectImages as any)[sportObjectName].forEach((image: string) => {
        sportObjectImages.push({
          sportObjectId,
          url: image,
        } as SportObjectImage);
      });
    });

    return queryInterface.bulkInsert('SportObjectImages', sportObjectImages);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    const sportObjects = await getTestSportObjects();
    const sportObjectIds = sportObjects.map((sportObject: SportObject) => sportObject.id as number);

    return queryInterface.bulkDelete(
      'SportObjectImages',
      {
        sportObjectId: {
          [Op.in]: sportObjectIds,
        },
      },
    );
  },
};
