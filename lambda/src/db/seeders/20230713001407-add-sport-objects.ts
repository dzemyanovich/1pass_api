import { QueryInterface, Op } from 'sequelize';

import SportObject from '../models/sport-object';

const sportObjects: SportObject[] = [
  {
    name: 'Poison BOX',
    address: 'ул. Лещинского 8',
    lat: 53.91226000038975,
    long: 27.451467018119395,
  } as SportObject,
  {
    name: 'CROSSiT',
    address: 'ул. Купревича 1/5',
    lat: 53.92796322906796,
    long: 27.681089535767622,
  } as SportObject,
  {
    name: 'STAYA BOX',
    address: 'ул. Тимирязева 9',
    lat: 53.90719490535783,
    long: 27.531684602939592,
  } as SportObject,
  {
    name: 'ФОРМА',
    address: 'ул. Притыцкого 29',
    lat: 53.90798928234661,
    long: 27.48417856648457,
  } as SportObject,
];

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    return queryInterface.bulkInsert('SportObjects', sportObjects);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    const where: { name: string, address: string }[] = [];
    sportObjects.forEach(({ name, address }) => where.push({ name, address }));

    return queryInterface.bulkDelete(
      'SportObjects',
      { [Op.or]: where },
    );
  },
};
