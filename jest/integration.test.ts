import {
  confirmMismatch,
  emailExists,
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
  registeredUser,
  notVerifiedUser,
  userPasswords,
} from '../lambda/src/db/utils/test-users';
import { get, post } from './utils/rest';
import { getToken, getUserId } from '../lambda/src/utils/auth';
import { getUserByPhone } from '../lambda/src/db/utils/repository';

const { API_URL } = process.env;
const SIGN_IN_URL = `${API_URL}/sign-in`;
const SIGN_UP_URL = `${API_URL}/sign-up`;
const SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;
const VALIDATE_TOKEN_URL = `${API_URL}/validate-token`;
const SEND_CODE_URL = `${API_URL}/auth-send-code`;
const VERIFY_CODE_URL = `${API_URL}/auth-verify-code`;
const CREATE_BOOKING_URL = `${API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${API_URL}/cancel-booking`;

describe('get-sport-objects', () => {
  it('gets all sport objects', async () => {
    const response: SportObjectVM[] = await get(SPORT_OBJECTS_URL);

    expect(response.length).toBeGreaterThan(0);
  });
});

describe('auth-send-code', () => {
  it('phone is missing', async () => {
    const response: EventResult<string> = await post(SEND_CODE_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
  });

  it('invalid phone (short string)', async () => {
    const response: EventResult<string> = await post(SEND_CODE_URL, {
      phone: '543',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
  });

  it('invalid phone (number instead of string)', async () => {
    const response: EventResult<string> = await post(SEND_CODE_URL, {
      phone: 142 as unknown as string,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(stringButNumber('phone'));
  });
});

describe('auth-verify-code', () => {
  it('phone is missing', async () => {
    const response: EventResult<string> = await post(VERIFY_CODE_URL, {
      code: 'some_code',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
  });

  it('code is missing', async () => {
    const response: EventResult<string> = await post(VERIFY_CODE_URL, {
      phone: '+375333366883',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('code'));
  });

  it('phone and code are missing', async () => {
    const response: EventResult<string> = await post(VERIFY_CODE_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
    expect(response.errors).toContain(required('code'));
  });

  it('invalid phone and code', async () => {
    const response: EventResult<string> = await post(VERIFY_CODE_URL, {
      phone: 'string',
      code: null,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
    expect(response.errors).toContain(stringButNull('code'));
  });
});

describe('sign-in', () => {
  const TEST_TIMEOUT_SEC = 10;

  it('success', async () => {
    const { phone } = registeredUser;
    const response: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: userPasswords[phone],
    });
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    expect(response.success).toBe(true);
    expect(response.data).toBeTruthy();
    expect(getUserId(token)).toEqual(getUserId(response.data as string));
  }, TEST_TIMEOUT_SEC * 1000);

  it('phone and password are missing', async () => {
    const response: EventResult<string> = await post(SIGN_IN_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
    expect(response.errors).toContain(required('password'));
  });

  it('invalid data', async () => {
    const response: EventResult<string> = await post(SIGN_IN_URL, {
      phone: '12412',
      password: true,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
    expect(response.errors).toContain(stringButBoolean('password'));
  });

  it('user not found', async () => {
    const response: EventResult<string> = await post(SIGN_IN_URL, {
      phone: '+12025550181',
      password: 'some_password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(userNotFound());
  });
});

describe('sign-up', () => {
  it('user already exists', async () => {
    const { phone } = registeredUser;

    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone,
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(userExists(phone));
  });

  it('phone not verified', async () => {
    const { phone } = notVerifiedUser;

    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone,
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(phoneNotVerified(phone));
  });

  it('email already exists', async () => {
    const { email } = registeredUser;

    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone: verifiedUser?.phone,
      firstName: 'any',
      lastName: 'any',
      email,
      confirmEmail: email,
      password: 'any_password',
      confirmPassword: 'any_password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(emailExists(email));
  });

  it('all data is missing', async () => {
    const response: EventResult<string> = await post(SIGN_UP_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
    expect(response.errors).toContain(required('firstName'));
    expect(response.errors).toContain(required('lastName'));
    expect(response.errors).toContain(required('email'));
    expect(response.errors).toContain(required('confirmEmail'));
    expect(response.errors).toContain(required('password'));
    expect(response.errors).toContain(required('confirmPassword'));
  });

  it('invalid data', async () => {
    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone: '123',
      firstName: 123,
      lastName: true,
      email: 'not-email',
      confirmEmail: 'not-email',
      password: 333,
      confirmPassword: 333,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
    expect(response.errors).toContain(stringButNumber('firstName'));
    expect(response.errors).toContain(stringButBoolean('lastName'));
    expect(response.errors).toContain(invalidEmail('email'));
    expect(response.errors).toContain(invalidEmail('confirmEmail'));
    expect(response.errors).toContain(stringButNumber('password'));
    expect(response.errors).toContain(stringButNumber('confirmPassword'));
  });

  it('invalid data (email and password do not match)', async () => {
    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone: '+375333366889a',
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth_2@mail.ru',
      password: 'password',
      confirmPassword: 'password_2',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
    expect(response.errors).toContain(confirmMismatch('email'));
    expect(response.errors).toContain(confirmMismatch('password'));
  });

  it('user not found', async () => {
    const response: EventResult<string> = await post(SIGN_UP_URL, {
      phone: '+375333366889',
      firstName: 'John',
      lastName: 'Smith',
      email: 'smth@mail.ru',
      confirmEmail: 'smth@mail.ru',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(userNotFound());
  });
});

describe('validate-token', () => {
  it('success', async () => {
    const { phone } = registeredUser;
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    const response: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token,
    });

    expect(response.success).toBe(true);
  });

  it('fail (not verified user)', async () => {
    const { phone } = notVerifiedUser;
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    const response: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token,
    });

    expect(response.success).toBe(false);
  });

  it('fail (verified user)', async () => {
    const { phone } = verifiedUser;
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    const response: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token,
    });

    expect(response.success).toBe(false);
  });

  it('fail (invalid token)', async () => {
    const response: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token: 'anything',
    });

    expect(response.success).toBe(false);
  });

  it('fail (token missing)', async () => {
    const response: EventResult<void> = await post(VALIDATE_TOKEN_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('token'));
  });
});

describe('create-booking', () => {
  it('invalid types', async () => {
    const response: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token: 1,
      sportObjectId: 'asdf',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(stringButNumber('token'));
    expect(response.errors).toContain(numberButString('sportObjectId'));
  });

  it('data missting', async () => {
    const response: EventResult<number> = await post(CREATE_BOOKING_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('token'));
    expect(response.errors).toContain(required('sportObjectId'));
  });

  it('invalid token', async () => {
    const response: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token: 'anything',
      sportObjectId: 1,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidToken());
  });

  it('no sport object', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: userPasswords[phone],
    });

    const response: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token: signInResponse.data,
      sportObjectId: -124,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(noSportObject());
  });
});

describe('cancel-booking', () => {
  it('invalid types', async () => {
    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token: 1,
      bookingId: 'asdf',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(stringButNumber('token'));
    expect(response.errors).toContain(numberButString('bookingId'));
  });

  it('data missting', async () => {
    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('token'));
    expect(response.errors).toContain(required('bookingId'));
  });

  it('invalid token', async () => {
    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token: 'anything',
      bookingId: 344,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidToken());
  });

  it('no booking', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: userPasswords[phone],
    });

    const token = signInResponse.data;

    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId: -343,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(noBooking());
  });
});
