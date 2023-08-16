import { Op } from 'sequelize';

import '../config/sequelize-instance'; // init sequelize
import User from '../models/user';
import SportObject from '../models/sport-object';
import { getHash } from '../../utils/auth';
import Booking from '../models/booking';

/************************* SPORT OBJECT *************************/

export async function getSportObjectById(id: number): Promise<SportObject> {
  return SportObject.findOne({ where: { id } }) as Promise<SportObject>;
}

export async function getSportObjects(): Promise<SportObject[]> {
  return SportObject.findAll();
}

/************************* USER *************************/

export async function createUser(phone: string): Promise<User> {
  return User.create({
    phone,
    verified: false,
  });
}

export async function getUserById(id: number): Promise<User> {
  return User.findOne({ where: { id } }) as Promise<User>;
}

export async function getUserByPhone(phone: string): Promise<User> {
  return User.findOne({ where: { phone } }) as Promise<User>;
}

export async function getUserByEmail(email: string): Promise<User> {
  return User.findOne({ where: { email } }) as Promise<User>;
}

export async function signIn(event: SignInEvent): Promise<User> {
  const { phone, password } = event;

  return User.findOne({ where: { phone, password: getHash(password) } }) as Promise<User>;
}

export async function setVerifed(phone: string, verified: boolean): Promise<[affectedCount: number]> {
  return User.update({ verified }, {
    where: {
      phone,
    },
  });
}

export async function signUp(event: SignUpEvent): Promise<[affectedCount: number]> {
  const { phone, firstName, lastName, email, password } = event;
  return User.update({ firstName, lastName, email, password: getHash(password) }, {
    where: {
      phone,
    },
  });
}

export async function deleteUser(id: number): Promise<number> {
  return User.destroy({
    where: {
      id,
    },
  });
}

export async function deleteUserByPhone(phone: string): Promise<number> {
  return User.destroy({
    where: {
      phone,
    },
  });
}

/************************* BOOKING *************************/

export async function createBooking(userId: number, sportObjectId: number): Promise<Booking> {
  return Booking.create({
    userId,
    sportObjectId,
    bookingTime: new Date(),
  });
}

// used for testing
export async function createTestBooking(userId: number, sportObjectId: number, bookingTime: Date): Promise<Booking> {
  return Booking.create({
    userId,
    sportObjectId,
    bookingTime,
  });
}

export async function confirmVisit(bookingId: number): Promise<[affectedCount: number]> {
  return Booking.update({ visitTime: new Date() }, {
    where: {
      id: bookingId,
    },
  });
}

export async function getBookingById(bookingId: number): Promise<Booking | null> {
  return Booking.findOne({
    where: {
      id: bookingId,
    },
  });
}

export async function getTodayBooking(userId: number, sportObjectId: number): Promise<Booking | null> {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const now = new Date();

  return Booking.findOne({
    where: {
      userId,
      sportObjectId,
      bookingTime: {
        [Op.gte]: todayStart,
        [Op.lte]: now,
      },
    },
  });
}

export async function deleteBooking(id: number): Promise<number> {
  return Booking.destroy({
    where: {
      id,
    },
  });
}
