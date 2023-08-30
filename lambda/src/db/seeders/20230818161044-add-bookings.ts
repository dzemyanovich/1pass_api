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
    const today = new Date();
    const bookingTimes: Date[] = [
      addDays(today, -1),
      addDays(today, -5),
      addDays(today, -10),
      addDays(today, -15),
      addDays(today, -20),
      addDays(today, -30),
      addDays(today, -100),
      addDays(today, -356),
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
