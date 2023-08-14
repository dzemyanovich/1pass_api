import {
  confirmMismatch,
  emailExists,
  invalidEmail,
  invalidInput,
  phoneNotVerified,
  required,
  stringButBoolean,
  stringButNull,
  stringNotNumber,
  userExists,
  userNotFound,
} from '../lambda/src/utils/errors';
import {
  verifiedUser,
  registeredUser,
  notVerifiedUser,
  registeredUserPassword,
} from '../lambda/src/db/utils/test-users';
import { get, post } from './utils/rest';
import { getToken, validateToken } from '../lambda/src/utils/auth';
import { closeConnection, getUserByPhone } from '../lambda/src/db/utils/repository';

describe('get-sport-objects', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/get-sport-objects`;

  it('gets all sport objects', async () => {
    const response: SportObjectVM[] = await get(URL);

    expect(response.length).toBeGreaterThan(0);
  });
});

describe('auth-send-code', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/auth-send-code`;

  it('phone is missing', async () => {
    const response: EventResult<string> = await post(URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
  });

  it('invalid phone (short string)', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '543',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
  });

  it('invalid phone (number instead of string)', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: 142 as unknown as string,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(stringNotNumber('phone'));
  });
});

describe('auth-verify-code', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/auth-verify-code`;

  it('phone is missing', async () => {
    const response: EventResult<string> = await post(URL, {
      code: 'some_code',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
  });

  it('code is missing', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '+375333366883',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('code'));
  });

  it('phone and code are missing', async () => {
    const response: EventResult<string> = await post(URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
    expect(response.errors).toContain(required('code'));
  });

  it('invalid phone and code', async () => {
    const response: EventResult<string> = await post(URL, {
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
  const { API_URL } = process.env;
  const URL = `${API_URL}/sign-in`;

  it('success', async () => {
    const { phone } = registeredUser;
    const response: EventResult<string> = await post(URL, {
      phone,
      password: registeredUserPassword,
    });
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    expect(response.success).toBe(true);
    expect(response.data).toBeTruthy();
    expect(validateToken(token)).toEqual(validateToken(response.data as string));
  }, TEST_TIMEOUT_SEC * 1000);

  it('phone and password are missing', async () => {
    const response: EventResult<string> = await post(URL, {});

    expect(response.success).toBe(false);
    expect(response.errors).toContain(required('phone'));
    expect(response.errors).toContain(required('password'));
  });

  it('invalid data', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '12412',
      password: true,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(invalidInput('phone'));
    expect(response.errors).toContain(stringButBoolean('password'));
  });

  it('user not found', async () => {
    const response: EventResult<string> = await post(URL, {
      phone: '+12025550181',
      password: 'some_password',
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(userNotFound());
  });

  afterAll(async () => {
    await closeConnection();
  });
});

describe('sign-up', () => {
  const { API_URL } = process.env;
  const URL = `${API_URL}/sign-up`;

  it('user already exists', async () => {
    const { phone } = registeredUser;

    const response: EventResult<string> = await post(URL, {
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

    const response: EventResult<string> = await post(URL, {
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

    const response: EventResult<string> = await post(URL, {
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
    const response: EventResult<string> = await post(URL, {});

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
    const response: EventResult<string> = await post(URL, {
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
    expect(response.errors).toContain(stringNotNumber('firstName'));
    expect(response.errors).toContain(stringButBoolean('lastName'));
    expect(response.errors).toContain(invalidEmail('email'));
    expect(response.errors).toContain(invalidEmail('confirmEmail'));
    expect(response.errors).toContain(stringNotNumber('password'));
    expect(response.errors).toContain(stringNotNumber('confirmPassword'));
  });

  it('invalid data (email and password do not match)', async () => {
    const response: EventResult<string> = await post(URL, {
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
    const response: EventResult<string> = await post(URL, {
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
