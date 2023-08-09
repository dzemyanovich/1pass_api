'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: any) {
    return queryInterface.bulkInsert('SportObjects', [{
      name: 'Poison BOX',
      address: 'ул. Лещинского 8',
      lat: 53.91226000038975,
      long: 27.451467018119395,
    },
    {
      name: 'CROSSiT',
      address: 'ул. Купревича 1/5',
      lat: 53.92796322906796,
      long: 27.681089535767622,
    },
    {
      name: 'STAYA BOX',
      address: 'ул. Тимирязева 9',
      lat: 53.90719490535783,
      long: 27.531684602939592,
    },
    {
      name: 'ФОРМА',
      address: 'ул. Притыцкого 29',
      lat: 53.90798928234661,
      long: 27.48417856648457,
    }]);
  },

  async down(queryInterface: any) {
    return queryInterface.bulkDelete('SportObjects', null, {});
  }
};
