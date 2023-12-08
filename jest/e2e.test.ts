import { handler as deleteExpiredTokens } from '../lambda/src/delete-expired-tokens';
import Booking from '../lambda/src/db/models/booking';
import User from '../lambda/src/db/models/user';
import { e2eUser, TEST_ADMIN_PASSWORD, TEST_USER_PASSWORD } from '../lambda/src/db/utils/test-data/test-users';
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
  invalidCredentials,
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
import {
  deleteFirebaseCollection,
  deleteFirebaseToken,
  getFirebaseTokens,
  sendNotifications,
  storeFirebaseToken,
} from '../lambda/src/utils/firebase';
import { getAdminToken, getHash, getUserId, getJwtExpireMilliseconds } from '../lambda/src/utils/auth';
import { addDays, daysToMilliseconds, delay, isToday } from '../lambda/src/utils/utils';
import { get, post } from './utils/rest';
import { expectAdminData, expectSportObject, expectBooking, expectSignInSuccess } from './utils/expect';
import {
  LONG_TEST_MS,
  VERY_LONG_TEST_MS,
  EXTREMELY_LONG_TEST_MS,
  REGISTER_TOKEN_DURATION,
  DELETE_TOKEN_DURATION,
} from './utils/constants';

const { USER_API_URL, ADMIN_API_URL } = process.env;
const SIGN_IN_URL = `${USER_API_URL}/sign-in`;
const SIGN_UP_URL = `${USER_API_URL}/sign-up`;
const USER_DATA_URL = `${USER_API_URL}/get-user-data`;
const SIGN_OUT_URL = `${USER_API_URL}/sign-out`;
const CREATE_BOOKING_URL = `${USER_API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${USER_API_URL}/cancel-booking`;
const ADMIN_SIGN_IN_URL = `${ADMIN_API_URL}/admin-sign-in`;
const CONFIRM_VISIT_URL = `${ADMIN_API_URL}/confirm-visit`;
const GET_ADMIN_DATA_URL = `${ADMIN_API_URL}/get-admin-data`;

const FIREBASE_TOKEN = 'firebase-token-from-e2e-test';

async function signOutUser(userToken: string): Promise<void> {
  if (!userToken) {
    return;
  }

  await delay(REGISTER_TOKEN_DURATION);

  const signOutRequest: SignOutRequest = {
    firebaseToken: FIREBASE_TOKEN,
    userToken,
  };

  const signOutResponse: EmptyResponse = await post(SIGN_OUT_URL, signOutRequest);
  if (!signOutResponse.success) {
    // eslint-disable-next-line no-console
    console.error('[ERROR] sign out failed');
    // eslint-disable-next-line no-console
    console.log('### signOutResponse = ', signOutResponse);
    return;
  }

  await delay(DELETE_TOKEN_DURATION);
}

describe('get-user-data', () => {
  let userToken: string;

  it('gets full user data', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    userToken = signInResponse.data?.token as string;
    const user: User = await getUserByPhone(phone);
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL, { token: userToken });

    expectSignInSuccess(signInResponse);
    expect(userDataResponse.success).toBe(true);
    expect(userDataResponse.data?.sportObjects.length).toBeGreaterThan(0);
    userDataResponse.data?.sportObjects.forEach((sportObject: SportObjectVM) => expectSportObject(sportObject));
    expect(userDataResponse.data?.bookings?.length).toBeGreaterThan(0);
    userDataResponse.data?.bookings?.forEach(expectBooking);
    expect(userDataResponse.data?.userInfo).toMatchObject({
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }, LONG_TEST_MS);

  afterAll(async () => {
    await signOutUser(userToken);
  }, VERY_LONG_TEST_MS);
});

describe('user workflow', () => {
  const phone = '+12025550156';
  const email = '12025550156@gmail.com';
  const firstName = 'any';
  const lastName = 'any';
  const password = 'password_1';

  let signUpToken: string;

  it('sign up + sign in + delete user', async () => {
    const signInFail: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password,
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signInFail.success).toBe(false);
    expect(signInFail.errors).toContain(invalidCredentials());

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
      firebaseToken: FIREBASE_TOKEN,
    });

    signUpToken = signUpResponse.data?.token as string;

    expect(signUpResponse.success).toBe(true);
    expect(signUpResponse.data).toMatchObject({
      token: expect.any(String),
      userInfo: {
        firstName,
        lastName,
        phone,
        email,
      },
    });

    const newUser = await getUserByPhone(phone);
    expect(newUser.firstName).toBe(firstName);
    expect(newUser.lastName).toBe(lastName);
    expect(newUser.email).toBe(email);
    expect(newUser.password).toBe(getHash(password));

    const sinInSuccess: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password,
      firebaseToken: FIREBASE_TOKEN,
    });
    const signInToken = sinInSuccess.data?.token as string;

    expectSignInSuccess(sinInSuccess, false);
    expect(getUserId(signInToken)).toEqual(getUserId(signUpToken));

    await deleteUser(newUser.id as number);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  }, LONG_TEST_MS);

  afterAll(async () => {
    await deleteUserByPhone(phone);

    if (signUpToken) {
      await signOutUser(signUpToken);
    }
  }, VERY_LONG_TEST_MS);
});

describe('booking workflow', () => {
  let bookingId: number;
  let userToken: string;

  it('create + delete booking', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });

    userToken = signInResponse.data?.token as string;
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: userToken,
      sportObjectId,
    });
    bookingId = createBookingResponse.data?.id as number;
    const newBooking = (await getBookingById(bookingId)) as Booking;

    expect(createBookingResponse.success).toBe(true);
    expectBooking(createBookingResponse.data as UserBooking);
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
      token: userToken,
      bookingId,
    });
    const deletedBooking = await getBookingById(bookingId);

    expect(cancelBookingResponse.success).toBe(true);
    expect(deletedBooking).toBeNull();
  }, LONG_TEST_MS);

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }

    if (userToken) {
      await signOutUser(userToken);
    }
  }, VERY_LONG_TEST_MS);
});

describe('create-booking', () => {
  const bookingIds: number[] = [];
  let userToken: string;

  it('already booked', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    userToken = signInResponse.data?.token as string;
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const createBookingSuccess: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: userToken,
      sportObjectId,
    });
    const bookingId = createBookingSuccess.data?.id as number;
    bookingIds.push(bookingId);

    expect(createBookingSuccess.success).toBe(true);
    expectBooking(createBookingSuccess.data as UserBooking);

    const createBookingFail: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: userToken,
      sportObjectId,
    });

    if (createBookingFail.data) {
      bookingIds.push(createBookingFail.data.id);
    }

    expect(createBookingFail.success).toBe(false);
    expect(createBookingFail.errors).toContain(alreadyBooked());

    await deleteBooking(bookingId);
  }, LONG_TEST_MS);

  afterAll(async () => {
    for (const bookingId of bookingIds) {
      if (bookingId) {
        await deleteBooking(bookingId);
      }
    }

    if (userToken) {
      await signOutUser(userToken);
    }
  }, VERY_LONG_TEST_MS);
});

describe('cancel-booking -> already visited', () => {
  let bookingId: number;
  let userToken: string;

  it('cannot cancel past booking: already visited', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    userToken = signInResponse.data?.token as string;
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;

    const createBookingSuccess: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: userToken,
      sportObjectId,
    });
    bookingId = createBookingSuccess.data?.id as number;

    expect(createBookingSuccess.success).toBe(true);
    expectBooking(createBookingSuccess.data as UserBooking);

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
      token: userToken,
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

    if (userToken) {
      await signOutUser(userToken);
    }
  }, VERY_LONG_TEST_MS);
});

describe('cancel-booking -> booking date is in the past', () => {
  let bookingId: number;
  let userToken: string;

  it('cancel-booking -> booking date is in the past', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    userToken = signInResponse.data?.token as string;
    const userId = getUserId(userToken) as number;
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);
    const sportObjects = userDataResponse.data?.sportObjects as SportObjectVM[];
    const sportObjectId = sportObjects[0].id;
    const yesterday = addDays(new Date(), -1);
    const booking = await createTestBooking(userId, sportObjectId, yesterday);
    bookingId = booking.id as number;

    expectSignInSuccess(signInResponse);
    expect(bookingId).toEqual(expect.any(Number));
    expect(booking.userId).toEqual(userId);
    expect(booking.sportObjectId).toEqual(sportObjectId);
    expect(booking.bookingTime).toEqual(yesterday);
    expect(booking.visitTime).toBeFalsy();

    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token: userToken,
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

    if (userToken) {
      await signOutUser(userToken);
    }
  }, VERY_LONG_TEST_MS);
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

    const user = await getUserByPhone(e2eUser.phone);
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

    const user = await getUserByPhone(e2eUser.phone);
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

    const user = await getUserByPhone(e2eUser.phone);
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

    const user = await getUserByPhone(e2eUser.phone);
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

describe('firebase API methods', () => {
  const firebaseToken1 = `${FIREBASE_TOKEN}-1`;
  const firebaseToken2 = `${FIREBASE_TOKEN}-2`;
  const firebaseToken3 = `${FIREBASE_TOKEN}-3`;

  let userId: number;
  let signInRequest1: SignInRequest;
  let signInRequest2: SignInRequest;
  let signInRequest3: SignInRequest;
  let userToken1: string;
  let userToken2: string;
  let userToken3: string;

  beforeEach(async () => {
    const { phone } = e2eUser;

    const user = await getUserByPhone(phone);
    userId = user.id;
    await deleteFirebaseCollection(userId);

    signInRequest1 = {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: firebaseToken1,
    };
    signInRequest2 = {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: firebaseToken2,
    };
    signInRequest3 = {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: firebaseToken3,
    };
  }, LONG_TEST_MS);

  it('sign-in & sign-out (checking firebase tokens)', async () => {
    const firebaseTokens0 = await getFirebaseTokens(userId);

    expect(firebaseTokens0).not.toContain(firebaseToken1);
    expect(firebaseTokens0).not.toContain(firebaseToken2);

    const signInResponse1: SignInResponse = await post(SIGN_IN_URL, signInRequest1);
    userToken1 = signInResponse1.data?.token as string;
    await delay(REGISTER_TOKEN_DURATION);
    const firebaseTokens1 = await getFirebaseTokens(userId);

    expect(signInResponse1.success).toBe(true);
    expect(firebaseTokens1).toContain(firebaseToken1);
    expect(firebaseTokens1.length).toBe(1);

    const signInResponse2: SignInResponse = await post(SIGN_IN_URL, signInRequest2);
    userToken2 = signInResponse2.data?.token as string;
    await delay(REGISTER_TOKEN_DURATION);
    const firebaseTokens2 = await getFirebaseTokens(userId);

    expect(signInResponse2.success).toBe(true);
    expect(firebaseTokens2).toContain(firebaseToken1);
    expect(firebaseTokens2).toContain(firebaseToken2);
    expect(firebaseTokens2.length).toBe(2);

    const signInResponse3: SignInResponse = await post(SIGN_IN_URL, signInRequest3);
    userToken3 = signInResponse3.data?.token as string;
    await delay(REGISTER_TOKEN_DURATION);
    const firebaseTokens3 = await getFirebaseTokens(userId);

    expect(signInResponse3.success).toBe(true);
    expect(firebaseTokens3).toContain(firebaseToken1);
    expect(firebaseTokens3).toContain(firebaseToken2);
    expect(firebaseTokens3).toContain(firebaseToken3);
    expect(firebaseTokens3.length).toBe(3);

    const signOutResponse1: EmptyResponse = await post(SIGN_OUT_URL, {
      firebaseToken: firebaseToken1,
      userToken: userToken1,
    });
    const signOutResponse2: EmptyResponse = await post(SIGN_OUT_URL, {
      firebaseToken: firebaseToken2,
      userToken: userToken2,
    });
    const signOutResponse3: EmptyResponse = await post(SIGN_OUT_URL, {
      firebaseToken: firebaseToken3,
      userToken: userToken3,
    });
    await delay(DELETE_TOKEN_DURATION);
    const emptyFirebaseTokens = await getFirebaseTokens(userId);

    expect(signOutResponse1).toMatchObject({
      success: true,
    });
    userToken1 = '';
    expect(signOutResponse2).toMatchObject({
      success: true,
    });
    userToken2 = '';
    expect(signOutResponse3).toMatchObject({
      success: true,
    });
    userToken3 = '';
    expect(emptyFirebaseTokens).not.toContain(firebaseToken1);
    expect(emptyFirebaseTokens).not.toContain(firebaseToken2);
    expect(emptyFirebaseTokens).not.toContain(firebaseToken3);
  }, EXTREMELY_LONG_TEST_MS);

  it('delete-expired-tokens', async () => {
    const jwtExpireMilliseconds = getJwtExpireMilliseconds();

    // token is NOT expired
    const userTokenData1 = {
      userId,
      createdAt: Date.now() - jwtExpireMilliseconds + daysToMilliseconds(1),
    };
    // token is expired
    const userTokenData2 = {
      userId,
      createdAt: Date.now() - jwtExpireMilliseconds - daysToMilliseconds(1),
    };
    // token is expired
    const userTokenData3 = {
      userId,
      createdAt: Date.now() - jwtExpireMilliseconds - daysToMilliseconds(30),
    };
    const firebaseTokens0 = await getFirebaseTokens(userId);

    expect(firebaseTokens0).not.toContain(firebaseToken1);
    expect(firebaseTokens0).not.toContain(firebaseToken2);
    expect(firebaseTokens0).not.toContain(firebaseToken3);

    await storeFirebaseToken(userTokenData1, firebaseToken1);
    await storeFirebaseToken(userTokenData2, firebaseToken2);
    await storeFirebaseToken(userTokenData3, firebaseToken3);

    const firebaseTokens1 = await getFirebaseTokens(userId);

    expect(firebaseTokens1).toContain(firebaseToken1);
    expect(firebaseTokens1).toContain(firebaseToken2);
    expect(firebaseTokens1).toContain(firebaseToken3);

    await deleteExpiredTokens();

    const firebaseTokens2 = await getFirebaseTokens(userId);

    expect(firebaseTokens2).toContain(firebaseToken1);
    expect(firebaseTokens2).not.toContain(firebaseToken2);
    expect(firebaseTokens2).not.toContain(firebaseToken3);

    await deleteFirebaseToken(userId, firebaseToken1);
    const firebaseTokens3 = await getFirebaseTokens(userId);

    expect(firebaseTokens3).not.toContain(firebaseToken1);
  }, VERY_LONG_TEST_MS);

  afterEach(async () => {
    if (userToken1) {
      await signOutUser(userToken1);
    }
    if (userToken2) {
      await signOutUser(userToken1);
    }
    if (userToken3) {
      await signOutUser(userToken1);
    }
    await delay(DELETE_TOKEN_DURATION);
  }, EXTREMELY_LONG_TEST_MS);
});

describe('firebase js methods', () => {
  const nonExistingUserId = -999;
  const bookingId = -123;
  const visitTime = new Date();
  const firebaseToken1 = 'any-token-1';
  const firebaseToken2 = 'any-token-2';

  it('sendNotifications', async () => {
    const userTokenData: TokenData = {
      userId: nonExistingUserId,
      createdAt: Date.now(),
    };

    await storeFirebaseToken(userTokenData, firebaseToken1);
    await storeFirebaseToken(userTokenData, firebaseToken2);
    await sendNotifications(nonExistingUserId, bookingId, visitTime, 'any-title', 'any-body');

    const tokens = await getFirebaseTokens(nonExistingUserId);

    expect(tokens.length).toBe(2);
    expect(tokens).toContain(firebaseToken1);
    expect(tokens).toContain(firebaseToken2);
  });

  it('deleteFirebaseToken', async () => {
    const userTokenData: TokenData = {
      userId: nonExistingUserId,
      createdAt: Date.now(),
    };

    // checks deletion of token which is not stored in Firebase
    await deleteFirebaseToken(nonExistingUserId, firebaseToken1);
    await storeFirebaseToken(userTokenData, firebaseToken1);

    const tokens = await getFirebaseTokens(nonExistingUserId);

    expect(tokens.length).toBe(1);
    expect(tokens).toContain(firebaseToken1);

    await deleteFirebaseToken(nonExistingUserId, 'i-do-not-exist');
    await deleteFirebaseToken(nonExistingUserId, firebaseToken1);

    const emptyTokens = await getFirebaseTokens(nonExistingUserId);

    expect(emptyTokens.length).toBe(0);
  });

  afterEach(async () => {
    await deleteFirebaseCollection(nonExistingUserId);
  });
});
