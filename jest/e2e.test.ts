import {
  confirmVisit,
  createTestBooking,
  createUser,
  deleteBooking,
  deleteUser,
  deleteUserByPhone,
  getAdminBySportObjectId,
  getAdmins,
  getBookingById,
  getUserByEmail,
  getUserByPhone,
  setVerifed,
} from '../lambda/src/db/utils/repository';
import {
  alreadyBooked,
  invalidToken,
  noBooking,
  noBookingAccess,
  numberButBoolean,
  pastBooking,
  required,
  stringButBoolean,
  stringButNumber,
  userNotFound,
} from '../lambda/src/utils/errors';
import Booking from '../lambda/src/db/models/booking';
import { registeredUser } from '../lambda/src/db/utils/test-users';
import { TEST_ADMIN_PASSWORD, TEST_USER_PASSWORD } from '../lambda/src/db/utils/utils';
import { getHash, getToken, getUserId } from '../lambda/src/utils/auth';
import { addDays, isToday } from '../lambda/src/utils/utils';
import { get, post } from './utils/rest';

const { API_URL, ADMIN_API_URL } = process.env;
const SIGN_IN_URL = `${API_URL}/sign-in`;
const SIGN_UP_URL = `${API_URL}/sign-up`;
const SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;
const CREATE_BOOKING_URL = `${API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${API_URL}/cancel-booking`;
const ADMIN_SIGN_IN_URL = `${ADMIN_API_URL}/admin-sign-in`;
const CONFIRM_VISIT_URL = `${ADMIN_API_URL}/confirm-visit`;
const GET_BOOKINGS_URL = `${ADMIN_API_URL}/get-bookings`;
const LONG_TEST_MS = 20 * 1000;

describe('user workflow', () => {
  const phone = '+12025550156';
  const email = '12025550156@gmail.com';
  const firstName = 'any';
  const lastName = 'any';
  const password = 'password_1';

  it('sign up + sign in + delete', async () => {
    const sinInFail: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(sinInFail.success).toBe(false);
    expect(sinInFail.errors).toContain(userNotFound());

    const createdUser = await createUser(phone);
    const notVerifiedUser = await getUserByPhone(phone);

    expect(notVerifiedUser.id).toBe(createdUser.id);
    expect(notVerifiedUser.phone).toBe(createdUser.phone);
    expect(notVerifiedUser.verified).toBe(false);
    expect(notVerifiedUser.password).toBeFalsy();

    await setVerifed(phone, true);
    const verifiedUser = await getUserByPhone(phone);

    expect(verifiedUser.id).toBe(createdUser.id);
    expect(verifiedUser.verified).toBe(true);
    expect(verifiedUser.password).toBeFalsy();

    const signUpResult: EventResult<string> = await post(SIGN_UP_URL, {
      phone,
      firstName,
      lastName,
      email,
      confirmEmail: email,
      password,
      confirmPassword: password,
    });

    expect(signUpResult.success).toBe(true);
    expect(signUpResult.data).toBeTruthy();

    const newUser = await getUserByPhone(phone);
    expect(newUser.firstName).toBe(firstName);
    expect(newUser.lastName).toBe(lastName);
    expect(newUser.email).toBe(email);
    expect(newUser.password).toBe(getHash(password));

    const sinInSuccess: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password,
    });
    const user = await getUserByPhone(phone);

    expect(sinInSuccess.success).toBe(true);
    expect(sinInSuccess.data).toBeTruthy();
    expect(getUserId(sinInSuccess.data as string)).toEqual(getUserId(signUpResult.data as string));

    await deleteUser(newUser.id as number);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  }, LONG_TEST_MS * 1000);

  afterAll(async () => {
    await deleteUserByPhone(phone);
  });
});

describe('booking workflow', () => {
  let bookingId: number;

  it('create + delete booking', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });

    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const createBookingResponse: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token: signInResponse.data,
      sportObjectId,
    });
    bookingId = createBookingResponse.data as number;
    const newBooking = (await getBookingById(bookingId)) as Booking;

    expect(createBookingResponse.success).toBe(true);
    expect(typeof bookingId).toBe('number');
    expect(newBooking.id).toEqual(bookingId);
    expect(newBooking).toMatchObject({
      id: bookingId,
      userId: expect.any(Number),
      sportObjectId,
      bookingTime: expect.any(Date),
      visitTime: null,
    });

    const cancelBookingResponse: EventResult<void> = await post(CANCEL_BOOKING_URL, {
      token: signInResponse.data,
      bookingId,
    });
    const deletedBooking = await getBookingById(bookingId);

    expect(cancelBookingResponse.success).toBe(true);
    expect(deletedBooking).toBeNull();
  }, LONG_TEST_MS * 1000);

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }
  });
});

describe('create-booking', () => {
  const bookingIds: number[] = [];

  it('already booked', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const token = signInResponse.data;

    const successResponse: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });
    const bookingId = successResponse.data as number;
    bookingIds.push(bookingId);

    expect(successResponse).toMatchObject({
      success: true,
      data: expect.any(Number),
    });

    const failResponse: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });

    if (failResponse.data) {
      bookingIds.push(failResponse.data);
    }

    expect(failResponse.success).toBe(false);
    expect(failResponse.errors).toContain(alreadyBooked());

    await deleteBooking(bookingId);
  });

  afterAll(async () => {
    for (const bookingId of bookingIds) {
      if (bookingId) {
        await deleteBooking(bookingId);
      }
    }
  });
});

describe('cancel-booking -> already visited', () => {
  let bookingId: number;

  it('cannot cancel past booking: already visited', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const token = signInResponse.data;

    const successResponse: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });
    bookingId = successResponse.data as number;

    expect(successResponse).toMatchObject({
      success: true,
      data: expect.any(Number),
    });

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });
    expect(adminSignInResult.success).toBe(true);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId,
    });
    const booking = await getBookingById(bookingId) as Booking;

    expect(confirmVisitResult.success).toBe(true);
    expect(isToday(booking.visitTime)).toBe(true);

    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }
  });
});

describe('cancel-booking -> booking date is in the past', () => {
  let bookingId: number;

  it('cancel-booking -> booking date is in the past', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const token = signInResponse.data as string;
    const userId = getUserId(token) as number;
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const yesterday = addDays(new Date(), -1);
    const booking = await createTestBooking(userId, sportObjectId, yesterday);
    bookingId = booking.id as number;

    expect(bookingId).toEqual(expect.any(Number));
    expect(booking.userId).toEqual(userId);
    expect(booking.sportObjectId).toEqual(sportObjectId);
    expect(booking.bookingTime).toEqual(yesterday);
    expect(booking.visitTime).toBeFalsy();

    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }
  });
});

describe('admin-sign-in', () => {
  it('invalid types', async () => {
    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: 123,
      password: true,
    });

    expect(adminSignInResult.success).toBe(false);
    expect(adminSignInResult.errors).toContain(stringButNumber('username'));
    expect(adminSignInResult.errors).toContain(stringButBoolean('password'));
  });

  it('data missig', async () => {
    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {});

    expect(adminSignInResult.success).toBe(false);
    expect(adminSignInResult.errors).toContain(required('username'));
    expect(adminSignInResult.errors).toContain(required('password'));
  });

  it('user not found (incorrect username and password)', async () => {
    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: 'asdf',
      password: 'adf',
    });

    expect(adminSignInResult.success).toBe(false);
    expect(adminSignInResult.errors).toContain(userNotFound());
  });

  it('user not found (incorrect password)', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: `${TEST_ADMIN_PASSWORD}_incorrect_one`,
    });

    expect(adminSignInResult.success).toBe(false);
    expect(adminSignInResult.errors).toContain(userNotFound());
  });

  it('success', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);
  });
});

describe('confirm-visit', () => {
  const bookingIds: number[] = [];

  it('success', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjectId, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId,
    });

    expect(confirmVisitResult.success).toBe(true);

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('invalid types', async () => {
    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: 123,
      bookingId: true,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(stringButNumber('token'));
    expect(confirmVisitResult.errors).toContain(numberButBoolean('bookingId'));
  });

  it('data missig', async () => {
    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {});

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(required('token'));
    expect(confirmVisitResult.errors).toContain(required('bookingId'));
  });

  it('invalid token', async () => {
    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: '123',
      bookingId: 333,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(invalidToken());
  });

  it('no booking found', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId: -133,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(noBooking());
  }, LONG_TEST_MS);

  it('no booking access', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjects[1].id, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(noBookingAccess());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('booking is in the past', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const user = await getUserByPhone(registeredUser.phone);
    const yesterday = addDays(new Date(), -1);
    const booking = await createTestBooking(user.id as number, sportObjectId, yesterday);
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('booking is already used', async () => {
    const sportObjectsResponse: EventResult<SportObjectVM[]> = await get(SPORT_OBJECTS_URL);
    const sportObjects = sportObjectsResponse.data as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjectId, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    await confirmVisit(bookingId);
    const visitedBooking = await getBookingById(bookingId);

    expect(isToday(visitedBooking?.visitTime as Date)).toBe(true);

    const confirmVisitResult: EventResult<void> = await post(CONFIRM_VISIT_URL, {
      token: adminSignInResult.data,
      bookingId,
    });

    expect(confirmVisitResult.success).toBe(false);
    expect(confirmVisitResult.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  afterAll(async () => {
    for (const bookingId of bookingIds) {
      if (bookingId) {
        await deleteBooking(bookingId);
      }
    }
  });
});

// todo: remove only
describe.only('get-bookings', () => {
  it('success', async () => {
    const admins = await getAdmins();
    const admin = admins[0];
    const adminSignInResult: EventResult<string> = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResult.success).toBe(true);

    const token = adminSignInResult.data;

    const response: EventResult<BookingVM[]> = await get(GET_BOOKINGS_URL, { token });

    expect(response.success).toBe(true);
    expect(response.data?.length).toBeGreaterThan(0);
  });

  it('invalid data', async () => {
    const response: EventResult<BookingVM[]> = await get(GET_BOOKINGS_URL, { token: 123 });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(stringButNumber('token'));
  });

  it('data missing', async () => {
    const response: EventResult<BookingVM[]> = await get(GET_BOOKINGS_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('token'));
  });

  it('invalid token', async () => {
    const response: EventResult<BookingVM[]> = await get(GET_BOOKINGS_URL, { token: '44444' });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidToken());
  });
});
