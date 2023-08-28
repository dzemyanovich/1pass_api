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
import { getAdminToken, getHash, getUserId } from '../lambda/src/utils/auth';
import { addDays, isToday } from '../lambda/src/utils/utils';
import { get, post } from './utils/rest';
import User from '../lambda/src/db/models/user';
import { expectAdminData, expectSportObject } from './utils/expect';

const { API_URL, ADMIN_API_URL } = process.env;
const SIGN_IN_URL = `${API_URL}/sign-in`;
const SIGN_UP_URL = `${API_URL}/sign-up`;
const USER_DATA_URL = `${API_URL}/get-user-data`;
const CREATE_BOOKING_URL = `${API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${API_URL}/cancel-booking`;
const ADMIN_SIGN_IN_URL = `${ADMIN_API_URL}/admin-sign-in`;
const CONFIRM_VISIT_URL = `${ADMIN_API_URL}/confirm-visit`;
const GET_ADMIN_DATA_URL = `${ADMIN_API_URL}/get-admin-data`;
const LONG_TEST_MS = 20 * 1000;

describe('get-user-data', () => {
  it('gets full user data', async () => {
    const { phone } = registeredUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const token = signInResponse.data as string;
    const user: User = await getUserByPhone(phone);
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL, { token });

    expect(userDataResponse.success).toBe(true);
    expect(userDataResponse.data?.sportObjects.length).toBeGreaterThan(0);
    userDataResponse.data?.sportObjects.forEach((sportObject: SportObjectVM) => expectSportObject(sportObject));
    expect(userDataResponse.data?.bookings?.length).toBeGreaterThan(0);
    userDataResponse.data?.bookings?.forEach(({ id, sportObject, bookingTime, visitTime }: UserBooking) => {
      expectSportObject(sportObject);
      expect(typeof id).toBe('number');
      expect(Date.parse(bookingTime as unknown as string)).toBeTruthy();
      if (visitTime) {
        expect(Date.parse(visitTime as unknown as string)).toBeTruthy();
      }
    });
    expect(userDataResponse.data?.userInfo).toMatchObject({
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }, LONG_TEST_MS);
});

describe('user workflow', () => {
  const phone = '+12025550156';
  const email = '12025550156@gmail.com';
  const firstName = 'any';
  const lastName = 'any';
  const password = 'password_1';

  it('sign up + sign in + delete', async () => {
    const signInFail: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(signInFail.success).toBe(false);
    expect(signInFail.errors).toContain(userNotFound());

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

    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone,
      firstName,
      lastName,
      email,
      confirmEmail: email,
      password,
      confirmPassword: password,
    });

    expect(signUpResponse.success).toBe(true);
    expect(signUpResponse.data).toBeTruthy();

    const newUser = await getUserByPhone(phone);
    expect(newUser.firstName).toBe(firstName);
    expect(newUser.lastName).toBe(lastName);
    expect(newUser.email).toBe(email);
    expect(newUser.password).toBe(getHash(password));

    const sinInSuccess: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(sinInSuccess.success).toBe(true);
    expect(sinInSuccess.data).toBeTruthy();
    expect(getUserId(sinInSuccess.data as string)).toEqual(getUserId(signUpResponse.data as string));

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
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });

    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
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

    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
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
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const token = signInResponse.data;

    const createBookingSuccess: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });
    const bookingId = createBookingSuccess.data as number;
    bookingIds.push(bookingId);

    expect(createBookingSuccess).toMatchObject({
      success: true,
      data: expect.any(Number),
    });

    const createBookingFail: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });

    if (createBookingFail.data) {
      bookingIds.push(createBookingFail.data);
    }

    expect(createBookingFail.success).toBe(false);
    expect(createBookingFail.errors).toContain(alreadyBooked());

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
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const token = signInResponse.data;

    const createBookingSuccess: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });
    bookingId = createBookingSuccess.data as number;

    expect(createBookingSuccess).toMatchObject({
      success: true,
      data: expect.any(Number),
    });

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId,
    });
    const booking = await getBookingById(bookingId) as Booking;

    expect(confirmVisitResponse.success).toBe(true);
    expect(isToday(new Date(confirmVisitResponse.data as Date))).toBe(true);
    expect(new Date(confirmVisitResponse.data as Date).toString()).toEqual(booking.visitTime.toString());

    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId,
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(pastBooking());

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
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const token = signInResponse.data as string;
    const userId = getUserId(token) as number;
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const yesterday = addDays(new Date(), -1);
    const booking = await createTestBooking(userId, sportObjectId, yesterday);
    bookingId = booking.id as number;

    expect(bookingId).toEqual(expect.any(Number));
    expect(booking.userId).toEqual(userId);
    expect(booking.sportObjectId).toEqual(sportObjectId);
    expect(booking.bookingTime).toEqual(yesterday);
    expect(booking.visitTime).toBeFalsy();

    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId,
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }
  });
});

describe('admin-sign-in', () => {
  it('success', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResponse: AdminSignInResponse = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: TEST_ADMIN_PASSWORD,
    });

    expect(adminSignInResponse.success).toBe(true);
    expectAdminData(adminSignInResponse.data?.adminData as AdminData, admin);
  }, LONG_TEST_MS);

  it('invalid types', async () => {
    const adminSignInResponse: AdminSignInResponse = await post(ADMIN_SIGN_IN_URL, {
      username: 123,
      password: true,
    });

    expect(adminSignInResponse.success).toBe(false);
    expect(adminSignInResponse.errors).toContain(stringButNumber('username'));
    expect(adminSignInResponse.errors).toContain(stringButBoolean('password'));
  });

  it('data missig', async () => {
    const adminSignInResponse: AdminSignInResponse = await post(ADMIN_SIGN_IN_URL, {});

    expect(adminSignInResponse.success).toBe(false);
    expect(adminSignInResponse.errors).toContain(required('username'));
    expect(adminSignInResponse.errors).toContain(required('password'));
  });

  it('user not found (incorrect username and password)', async () => {
    const adminSignInResponse: AdminSignInResponse = await post(ADMIN_SIGN_IN_URL, {
      username: 'asdf',
      password: 'adf',
    });

    expect(adminSignInResponse.success).toBe(false);
    expect(adminSignInResponse.errors).toContain(userNotFound());
  });

  it('user not found (incorrect password)', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);

    const adminSignInResponse: AdminSignInResponse = await post(ADMIN_SIGN_IN_URL, {
      username: admin.username,
      password: `${TEST_ADMIN_PASSWORD}_incorrect_one`,
    });

    expect(adminSignInResponse.success).toBe(false);
    expect(adminSignInResponse.errors).toContain(userNotFound());
  });
});

describe('confirm-visit', () => {
  const bookingIds: number[] = [];

  it('success', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjectId, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId,
    });

    expect(confirmVisitResponse.success).toBe(true);
    expect(isToday(new Date(confirmVisitResponse.data as Date))).toBe(true);

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('invalid types', async () => {
    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: 123,
      bookingId: true,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(stringButNumber('token'));
    expect(confirmVisitResponse.errors).toContain(numberButBoolean('bookingId'));
  });

  it('data missig', async () => {
    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {});

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(required('token'));
    expect(confirmVisitResponse.errors).toContain(required('bookingId'));
  });

  it('invalid token', async () => {
    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: '123',
      bookingId: 333,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(invalidToken());
  });

  it('no booking found', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId: -133,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(noBooking());
  }, LONG_TEST_MS);

  it('no booking access', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjects[1].id, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(noBookingAccess());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('booking is in the past', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const user = await getUserByPhone(registeredUser.phone);
    const yesterday = addDays(new Date(), -1);
    const booking = await createTestBooking(user.id as number, sportObjectId, yesterday);
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  it('booking is already used', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const admin = await getAdminBySportObjectId(sportObjectId);
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const user = await getUserByPhone(registeredUser.phone);
    const booking = await createTestBooking(user.id as number, sportObjectId, new Date());
    const bookingId = booking.id as number;
    bookingIds.push(bookingId);

    await confirmVisit(bookingId);
    const visitedBooking = await getBookingById(bookingId);

    expect(isToday(visitedBooking?.visitTime as Date)).toBe(true);

    const confirmVisitResponse: ConfirmVisitResponse = await post(CONFIRM_VISIT_URL, {
      token: adminToken,
      bookingId,
    });

    expect(confirmVisitResponse.success).toBe(false);
    expect(confirmVisitResponse.errors).toContain(pastBooking());

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

describe('get-admin-data', () => {
  it('success', async () => {
    const admins = await getAdmins();
    const admin = admins[0];
    const adminToken = getAdminToken(admin.id as number);

    expect(adminToken).toBeTruthy();

    const adminDataResponse: AdminDataResponse = await get(GET_ADMIN_DATA_URL, {
      token: adminToken,
    });

    expect(adminDataResponse.success).toBe(true);
    expectAdminData(adminDataResponse.data as AdminData, admin);
  }, LONG_TEST_MS);

  it('data missing', async () => {
    const adminDataResponse: AdminDataResponse = await get(GET_ADMIN_DATA_URL, {});

    expect(adminDataResponse.success).toBe(false);
    expect(adminDataResponse.errors).toContain(required('token'));
  });

  it('invalid token', async () => {
    const adminDataResponse: AdminDataResponse = await get(GET_ADMIN_DATA_URL, { token: '44444' });

    expect(adminDataResponse.success).toBe(false);
    expect(adminDataResponse.errors).toContain(invalidToken());
  });
});
