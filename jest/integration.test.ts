import {
  sendNotifications,
  getFirebaseTokens,
  deleteFirebaseToken,
  deleteFirebaseCollection,
} from '../lambda/src/utils/firebase';
import { getToken, getUserId } from '../lambda/src/utils/auth';
import {
  getAllTestUsers,
  getTestSportObjects,
  getTestUsers,
  getUserByPhone,
} from '../lambda/src/db/utils/repository';
import {
  confirmMismatch,
  emailExists,
  invalidCredentials,
  invalidEmail,
  invalidInput,
  invalidToken,
  noBooking,
  noSportObject,
  numberButString,
  phoneNotVerified,
  required,
  stringButBoolean,
  stringButNull,
  stringButNumber,
  userExists,
  userNotFound,
} from '../lambda/src/utils/errors';
import {
  verifiedUser,
  e2eUser,
  notVerifiedUser,
  TEST_USER_PASSWORD,
  TEST_USER_EMAIL_PREFIX,
  E2E_USER_EMAIL_PREFIX,
  UI_USER_EMAIL_PREFIX,
} from '../lambda/src/db/utils/test-data/test-users';
import testSportObjects from '../lambda/src/db/utils/test-data/test-sport-objects';
import { get, post } from './utils/rest';
import { expectSignInSuccess, expectSportObjects } from './utils/expect';
import { LONG_TEST_MS, REGISTER_TOKEN_DURATION } from './utils/constants';
import SportObject from '../lambda/src/db/models/sport-object';
import User from '../lambda/src/db/models/user';
import { delay } from '../lambda/src/utils/utils';

const { USER_API_URL } = process.env;
const SIGN_IN_URL = `${USER_API_URL}/sign-in`;
const SIGN_UP_URL = `${USER_API_URL}/sign-up`;
const USER_DATA_URL = `${USER_API_URL}/get-user-data`;
const SEND_CODE_URL = `${USER_API_URL}/auth-send-code`;
const VERIFY_CODE_URL = `${USER_API_URL}/auth-verify-code`;
const CREATE_BOOKING_URL = `${USER_API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${USER_API_URL}/cancel-booking`;

const FIREBASE_TOKEN = 'firebase-token-from-integration-test';

describe('get-user-data', () => {
  it('gets all sport objects (token not passed)', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL);

    expectSportObjects(userDataResponse);
  });

  it('gets all sport objects (invalid token passed)', async () => {
    const userDataResponse: UserDataResponse = await get(USER_DATA_URL, { token: 'asdf' });

    expectSportObjects(userDataResponse);
  });
});

describe('auth-send-code', () => {
  it('phone is missing', async () => {
    const sendCodeResponse: SendCodeResponse = await post(SEND_CODE_URL, {});

    expect(sendCodeResponse.success).toBe(false);
    expect(sendCodeResponse.errors).toContain(required('phone'));
  });

  it('invalid phone (short string)', async () => {
    const sendCodeResponse: SendCodeResponse = await post(SEND_CODE_URL, {
      phone: '543',
    });

    expect(sendCodeResponse.success).toBe(false);
    expect(sendCodeResponse.errors).toContain(invalidInput('phone'));
  });

  it('invalid phone (number instead of string)', async () => {
    const sendCodeResponse: SendCodeResponse = await post(SEND_CODE_URL, {
      phone: 142 as unknown as string,
    });

    expect(sendCodeResponse.success).toBe(false);
    expect(sendCodeResponse.errors).toContain(stringButNumber('phone'));
  });
});

describe('auth-verify-code', () => {
  it('phone is missing', async () => {
    const verifyCodeResponse: VerifyCodeResponse = await post(VERIFY_CODE_URL, {
      code: 'some_code',
    });

    expect(verifyCodeResponse.success).toBe(false);
    expect(verifyCodeResponse.errors).toContain(required('phone'));
  });

  it('code is missing', async () => {
    const verifyCodeResponse: VerifyCodeResponse = await post(VERIFY_CODE_URL, {
      phone: '+375333366883',
    });

    expect(verifyCodeResponse.success).toBe(false);
    expect(verifyCodeResponse.errors).toContain(required('code'));
  });

  it('phone and code are missing', async () => {
    const verifyCodeResponse: VerifyCodeResponse = await post(VERIFY_CODE_URL, {});

    expect(verifyCodeResponse.success).toBe(false);
    expect(verifyCodeResponse.errors).toContain(required('phone'));
    expect(verifyCodeResponse.errors).toContain(required('code'));
  });

  it('invalid phone and code', async () => {
    const verifyCodeResponse: VerifyCodeResponse = await post(VERIFY_CODE_URL, {
      phone: 'string',
      code: null,
    });

    expect(verifyCodeResponse.success).toBe(false);
    expect(verifyCodeResponse.errors).toContain(invalidInput('phone'));
    expect(verifyCodeResponse.errors).toContain(stringButNull('code'));
  });
});

describe('sign-in', () => {
  let user: User;

  it('success', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    expectSignInSuccess(signInResponse);
    expect(getUserId(token)).toEqual(getUserId(signInResponse.data?.token as string));
  }, LONG_TEST_MS);

  it('data is missing', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {});

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(required('phone'));
    expect(signInResponse.errors).toContain(required('password'));
    expect(signInResponse.errors).toContain(required('firebaseToken'));
  });

  it('invalid data', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone: '12412',
      password: true,
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(invalidInput('phone'));
    expect(signInResponse.errors).toContain(stringButBoolean('password'));
  });

  it('invalid credentials', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone: '+12025550181',
      password: 'some_password',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(invalidCredentials());
  });

  afterAll(async () => {
    if (user) {
      await delay(REGISTER_TOKEN_DURATION);
      await deleteFirebaseCollection(user.id as number);
    }
  }, LONG_TEST_MS);
});

describe('sign-up', () => {
  it('user already exists', async () => {
    const { phone } = e2eUser;

    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone,
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(userExists(phone));
  });

  it('phone not verified', async () => {
    const { phone } = notVerifiedUser;

    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone,
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(phoneNotVerified(phone));
  });

  it('email already exists', async () => {
    const { email } = e2eUser;

    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone: verifiedUser?.phone,
      firstName: 'any',
      lastName: 'any',
      email,
      confirmEmail: email,
      password: 'any_password',
      confirmPassword: 'any_password',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(emailExists(email));
  });

  it('all data is missing', async () => {
    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {});

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(required('phone'));
    expect(signUpResponse.errors).toContain(required('firstName'));
    expect(signUpResponse.errors).toContain(required('lastName'));
    expect(signUpResponse.errors).toContain(required('email'));
    expect(signUpResponse.errors).toContain(required('confirmEmail'));
    expect(signUpResponse.errors).toContain(required('password'));
    expect(signUpResponse.errors).toContain(required('confirmPassword'));
    expect(signUpResponse.errors).toContain(required('firebaseToken'));
  });

  it('invalid data', async () => {
    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone: '123',
      firstName: 123,
      lastName: true,
      email: 'not-email',
      confirmEmail: 'not-email',
      password: 333,
      confirmPassword: 333,
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(invalidInput('phone'));
    expect(signUpResponse.errors).toContain(stringButNumber('firstName'));
    expect(signUpResponse.errors).toContain(stringButBoolean('lastName'));
    expect(signUpResponse.errors).toContain(invalidEmail('email'));
    expect(signUpResponse.errors).toContain(invalidEmail('confirmEmail'));
    expect(signUpResponse.errors).toContain(stringButNumber('password'));
    expect(signUpResponse.errors).toContain(stringButNumber('confirmPassword'));
  });

  it('invalid data (email and password do not match)', async () => {
    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone: '+375333366889a',
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth_2@mail.ru',
      password: 'password',
      confirmPassword: 'password_2',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(invalidInput('phone'));
    expect(signUpResponse.errors).toContain(confirmMismatch('email'));
    expect(signUpResponse.errors).toContain(confirmMismatch('password'));
  });

  it('user not found', async () => {
    const signUpResponse: SignUpResponse = await post(SIGN_UP_URL, {
      phone: '+375333366889',
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
      firebaseToken: FIREBASE_TOKEN,
    });

    expect(signUpResponse.success).toBe(false);
    expect(signUpResponse.errors).toContain(userNotFound());
  });
});

describe('create-booking', () => {
  it('invalid types', async () => {
    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: 1,
      sportObjectId: 'asdf',
    });

    expect(createBookingResponse.success).toBe(false);
    expect(createBookingResponse.errors).toContain(stringButNumber('token'));
    expect(createBookingResponse.errors).toContain(numberButString('sportObjectId'));
  });

  it('data missting', async () => {
    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {});

    expect(createBookingResponse.success).toBe(false);
    expect(createBookingResponse.errors).toContain(required('token'));
    expect(createBookingResponse.errors).toContain(required('sportObjectId'));
  });

  it('invalid token', async () => {
    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token: 'anything',
      sportObjectId: 1,
    });

    expect(createBookingResponse.success).toBe(false);
    expect(createBookingResponse.errors).toContain(invalidToken());
  });

  it('no sport object', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    const token = signInResponse.data?.token as string;

    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId: -124,
    });

    expect(createBookingResponse.success).toBe(false);
    expect(createBookingResponse.errors).toContain(noSportObject());
  });

  afterAll(async () => {
    const { phone } = e2eUser;
    const user = await getUserByPhone(phone);

    await delay(REGISTER_TOKEN_DURATION);
    await deleteFirebaseCollection(user.id as number);
  }, LONG_TEST_MS);
});

describe('cancel-booking', () => {
  it('invalid types', async () => {
    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token: 1,
      bookingId: 'asdf',
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(stringButNumber('token'));
    expect(cancelBookingResponse.errors).toContain(numberButString('bookingId'));
  });

  it('data missting', async () => {
    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {});

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(required('token'));
    expect(cancelBookingResponse.errors).toContain(required('bookingId'));
  });

  it('invalid token', async () => {
    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token: 'anything',
      bookingId: 344,
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(invalidToken());
  });

  it('no booking', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
      firebaseToken: FIREBASE_TOKEN,
    });
    const token = signInResponse.data?.token as string;
    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId: -343,
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(noBooking());
  });

  afterAll(async () => {
    const { phone } = e2eUser;
    const user = await getUserByPhone(phone);

    await delay(REGISTER_TOKEN_DURATION);
    await deleteFirebaseCollection(user.id as number);
  }, LONG_TEST_MS);
});

describe('firebase', () => {
  const nonExistingUserId = -123;
  const bookingId = -999;
  const visitTime = new Date();

  it('[sendNotifications] send notifications when user id does not exist', async () => {
    await sendNotifications(nonExistingUserId, bookingId, visitTime, 'any title', 'any body');
  });

  it('[getFirebaseTokens] get tokens when user id does not exist', async () => {
    const firebaseTokens = await getFirebaseTokens(nonExistingUserId);

    expect(firebaseTokens.length).toBe(0);
  });

  it('[deleteFirebaseToken] delete tokens when user id does not exist', async () => {
    await deleteFirebaseToken(nonExistingUserId, 'any-token');
  });
});

describe('test-data', () => {
  it('getTestSportObjects', async () => {
    const sportObjects = await getTestSportObjects();
    const firstSportObject = testSportObjects[0];
    const lastSportObject = testSportObjects[testSportObjects.length - 1];

    expect(sportObjects.length).toBe(testSportObjects.length);
    expect(sportObjects.find(({ name, address }: SportObject) => name === firstSportObject.name
      && address === firstSportObject.address)).toBeTruthy();
    expect(sportObjects.find(({ name, address }: SportObject) => name === lastSportObject.name
      && address === lastSportObject.address)).toBeTruthy();
  });

  it('getTestUsers', async () => {
    const testUsers = await getTestUsers();
    testUsers.forEach((user: User) => {
      expect(user.verified).toBe(true);
      expect(user.email.startsWith(TEST_USER_EMAIL_PREFIX));
    });
  });

  it('getAllTestUsers', async () => {
    const testUsers = await getAllTestUsers();
    testUsers.forEach((user: User) => {
      expect(user.verified).toBe(true);
      expect(user.email.startsWith(TEST_USER_EMAIL_PREFIX)
        || user.email.startsWith(E2E_USER_EMAIL_PREFIX)
        || user.email.startsWith(UI_USER_EMAIL_PREFIX)).toBe(true);
    });
  });
});
