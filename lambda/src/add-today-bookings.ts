import Booking from './db/models/booking';
import SportObject from './db/models/sport-object';
import User from './db/models/user';
import { createTestBookings, getSportObjects, getTestUsers } from './db/utils/repository';
import { getRandomValue } from './utils/utils';

export async function handler(): Promise<Booking[]> {
  const users: User[] = await getTestUsers();
  const sportObjects: SportObject[] = await getSportObjects();
  const bookings: Booking[] = [];

  users.forEach((user: User) => {
    sportObjects.forEach((sportObject: SportObject) => {
      const today = new Date();
      bookings.push({
        userId: user.id,
        sportObjectId: sportObject.id,
        bookingTime: today,
        visitTime: getRandomValue([today, null]),
      } as Booking);
    });
  });

  return createTestBookings(bookings);
}
