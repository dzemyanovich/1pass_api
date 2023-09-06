import { QueryInterface, Op } from 'sequelize';

import { getSportObjects, getAllTestUsers } from '../utils/repository';
import Booking from '../models/booking';
import User from '../models/user';
import SportObject from '../models/sport-object';
import { addDays, getRandomValue } from '../../utils/utils';

export default {
  async up(queryInterface: QueryInterface): Promise<object | number> {
    const sportObjects = await getSportObjects();
    const users = await getAllTestUsers();
    const bookings: Booking[] = [];
    const bookingTimes: Date[] = [
      addDays(new Date(), -1),
      addDays(new Date(), -5),
      addDays(new Date(), -10),
      addDays(new Date(), -15),
      addDays(new Date(), -20),
      addDays(new Date(), -30),
      addDays(new Date(), -100),
      addDays(new Date(), -356),
    ];

    users.forEach((user: User) => {
      sportObjects.forEach((sportObject: SportObject) => {
        bookingTimes.forEach((bookingTime: Date) => {
          bookings.push({
            userId: user.id,
            sportObjectId: sportObject.id,
            bookingTime,
            visitTime: getRandomValue([bookingTime, null]),
          } as Booking);
        });
      });
    });

    return queryInterface.bulkInsert('Bookings', bookings);
  },

  async down(queryInterface: QueryInterface): Promise<object> {
    const users = await getAllTestUsers();
    const userIds = users.map((user: User) => user.id as number);

    return queryInterface.bulkDelete(
      'Bookings',
      {
        userId: {
          [Op.in]: userIds,
        },
      },
    );
  },
};
