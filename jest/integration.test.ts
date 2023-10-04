import { sendNotification, getFirebaseTokens, deleteFirebaseToken } from '../lambda/src/utils/firebase';
import { getToken, getUserId } from '../lambda/src/utils/auth';
import { getUserByPhone } from '../lambda/src/db/utils/repository';
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
} from '../lambda/src/db/utils/test-users';
import { get, post } from './utils/rest';
import { expectSignInSuccess, expectSportObjects } from './utils/expect';
import { LONG_TEST_MS } from './utils/constants';

const { USER_API_URL } = process.env;
const SIGN_IN_URL = `${USER_API_URL}/sign-in`;
const SIGN_UP_URL = `${USER_API_URL}/sign-up`;
const USER_DATA_URL = `${USER_API_URL}/get-user-data`;
const SEND_CODE_URL = `${USER_API_URL}/auth-send-code`;
const VERIFY_CODE_URL = `${USER_API_URL}/auth-verify-code`;
const CREATE_BOOKING_URL = `${USER_API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${USER_API_URL}/cancel-booking`;

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
  it('success', async () => {
    const { phone } = e2eUser;
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone,
      password: TEST_USER_PASSWORD,
    });
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    expectSignInSuccess(signInResponse);
    expect(getUserId(token)).toEqual(getUserId(signInResponse.data?.token as string));
  }, LONG_TEST_MS);

  it('phone and password are missing', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {});

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(required('phone'));
    expect(signInResponse.errors).toContain(required('password'));
  });

  it('invalid data', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone: '12412',
      password: true,
    });

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(invalidInput('phone'));
    expect(signInResponse.errors).toContain(stringButBoolean('password'));
  });

  it('invalid credentials', async () => {
    const signInResponse: SignInResponse = await post(SIGN_IN_URL, {
      phone: '+12025550181',
      password: 'some_password',
    });

    expect(signInResponse.success).toBe(false);
    expect(signInResponse.errors).toContain(invalidCredentials());
  });
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
    });
    const token = signInResponse.data?.token as string;

    const createBookingResponse: CreateBookingResponse = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId: -124,
    });

    expect(createBookingResponse.success).toBe(false);
    expect(createBookingResponse.errors).toContain(noSportObject());
  });
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
    });
    const token = signInResponse.data?.token as string;
    const cancelBookingResponse: CancelBookingResponse = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId: -343,
    });

    expect(cancelBookingResponse.success).toBe(false);
    expect(cancelBookingResponse.errors).toContain(noBooking());
  });
});

describe('firebase', () => {
  const nonExistingUserId = -123;

  it('[sendNotification] send notification when user id does not exist', async () => {
    await sendNotification(nonExistingUserId, 'any title', 'any body');
  });

  it('[getFirebaseTokens] get tokens when user id does not exist', async () => {
    const firebaseTokens = await getFirebaseTokens(nonExistingUserId);

    expect(firebaseTokens.length).toBe(0);
  });

  it('[deleteFirebaseToken] delete tokens when user id does not exist', async () => {
    await deleteFirebaseToken(nonExistingUserId, 'any-token');
  });
});
