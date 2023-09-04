import { Op, literal } from 'sequelize';

import '../config/sequelize-instance'; // init sequelize
import { getHash } from '../../utils/auth';
import User from '../models/user';
import SportObject from '../models/sport-object';
import Booking from '../models/booking';
import Admin from '../models/admin';
import { E2E_USER_EMAIL_PREFIX, TEST_USER_EMAIL_PREFIX } from './test-users';

async function runQuery<T>(query: () => Promise<T>): Promise<T> {
  let result: T;
  try {
    result = await query();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    throw error;
  }
  return result;
}

/************************* SPORT OBJECT *************************/

export async function getSportObjectById(id: number): Promise<SportObject> {
  return runQuery(() => SportObject.findOne({
    where: {
      id,
    },
  }) as Promise<SportObject>);
}

export async function getSportObjects(): Promise<SportObject[]> {
  return runQuery(() => SportObject.findAll());
}

/************************* USER *************************/

export async function createUser(phone: string): Promise<User> {
  return runQuery(() => User.create({
    phone,
    verified: false,
  }));
}

// gets all registered test users (excluding e2e and ui test users)
export async function getTestUsers(): Promise<User[]> {
  return runQuery(() => User.findAll({
    where: {
      verified: true,
      email: {
        [Op.like]: `${TEST_USER_EMAIL_PREFIX}%`,
      },
    },
  }));
}

// gets all registered test users + e2e ones (excluding ui test users)
export async function getAllTestUsers(): Promise<User[]> {
  return runQuery(() => User.findAll({
    where: {
      verified: true,
      [Op.or]: [
        {
          email: {
            [Op.like]: `${TEST_USER_EMAIL_PREFIX}%`,
          },
        },
        {
          email: {
            [Op.like]: `${E2E_USER_EMAIL_PREFIX}%`,
          },
        },
      ],
    },
  }));
}

export async function getUserById(id: number): Promise<User> {
  return runQuery(() => User.findOne({
    where: {
      id,
    },
  }) as Promise<User>);
}

export async function getUserByPhone(phone: string): Promise<User> {
  return runQuery(() => User.findOne({
    where: {
      phone,
    },
  }) as Promise<User>);
}

export async function getUserByEmail(email: string): Promise<User> {
  return runQuery(() => User.findOne({
    where: {
      email,
    },
  }) as Promise<User>);
}

export async function signIn(event: SignInRequest): Promise<User> {
  const { phone, password } = event;

  return runQuery(() => User.findOne({
    where: {
      phone,
      password: getHash(password),
    },
  }) as Promise<User>);
}

export async function setVerifed(phone: string, verified: boolean): Promise<[affectedCount: number]> {
  return runQuery(() => User.update({ verified }, {
    where: {
      phone,
    },
  }));
}

export async function signUp(event: SignUpRequest): Promise<[affectedCount: number]> {
  const { phone, firstName, lastName, email, password } = event;

  return runQuery(() => User.update({ firstName, lastName, email, password: getHash(password) }, {
    where: {
      phone,
    },
  }));
}

export async function deleteUser(id: number): Promise<number> {
  return runQuery(() => User.destroy({
    where: {
      id,
    },
  }));
}

export async function deleteUserByPhone(phone: string): Promise<number> {
  return runQuery(() => User.destroy({
    where: {
      phone,
    },
  }));
}

/************************* BOOKING *************************/

export async function createBooking(userId: number, sportObjectId: number): Promise<Booking> {
  return runQuery(() => Booking.create({
    userId,
    sportObjectId,
    bookingTime: new Date(),
  }));
}

// used for testing
export async function createTestBooking(
  userId: number,
  sportObjectId: number,
  bookingTime: Date,
): Promise<Booking> {
  return runQuery(() => Booking.create({
    userId,
    sportObjectId,
    bookingTime,
  }));
}

// used for testing
export async function createTestBookings(bookings: Booking[]): Promise<Booking[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return runQuery(() => Booking.bulkCreate(bookings as any));
}

export async function confirmVisit(bookingId: number): Promise<[affectedCount: number]> {
  return runQuery(() => Booking.update({ visitTime: new Date() }, {
    where: {
      id: bookingId,
    },
  }));
}

export async function getBookingById(bookingId: number): Promise<Booking | null> {
  return runQuery(() => Booking.findOne({
    where: {
      id: bookingId,
    },
  }));
}

export async function getTodayBooking(userId: number, sportObjectId: number): Promise<Booking | null> {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const now = new Date();

  return runQuery(() => Booking.findOne({
    where: {
      userId,
      sportObjectId,
      bookingTime: {
        [Op.gte]: todayStart,
        [Op.lte]: now,
      },
    },
  }));
}

export async function getBookings(adminId: number): Promise<Booking[]> {
  return runQuery(() => Booking.findAll({
    include: {
      model: User,
      as: 'user',
    },
    where: {
      sportObjectId: {
        [Op.eq]: literal(`(
            SELECT sportObjectId FROM Admins
            WHERE Admins.id = ${adminId}
          )`),
      },
    },
  }));
}

export async function getUserBookings(userId: number): Promise<Booking[]> {
  return runQuery(() => Booking.findAll({
    include: {
      model: SportObject,
      as: 'sportObject',
    },
    where: {
      userId,
    },
    order: [
      ['bookingTime', 'DESC'],
    ],
  }));
}

export async function deleteBooking(id: number): Promise<number> {
  return runQuery(() => Booking.destroy({
    where: {
      id,
    },
  }));
}

/************************* ADMIN *************************/

export async function getAdmins(): Promise<Admin[]> {
  return runQuery(() => Admin.findAll());
}

export async function getAdminById(id: number): Promise<Admin> {
  return runQuery(() => Admin.findOne({
    where: {
      id,
    },
  }) as Promise<Admin>);
}

export async function getFullAdmin(id: number): Promise<Admin> {
  return runQuery(() => Admin.findOne({
    include: {
      model: SportObject,
      as: 'sportObject',
    },
    where: {
      id,
    },
  }) as Promise<Admin>);
}

export async function adminSignIn(event: AdminSignInRequest): Promise<Admin> {
  const { username, password } = event;

  return runQuery(() => Admin.findOne({
    include: {
      model: SportObject,
      as: 'sportObject',
    },
    where: {
      username,
      password: getHash(password),
    },
  }) as Promise<Admin>);
}

export async function getAdminBySportObjectId(sportObjectId: number): Promise<Admin> {
  return runQuery(() => Admin.findOne({
    where: {
      sportObjectId,
    },
  }) as Promise<Admin>);
}
