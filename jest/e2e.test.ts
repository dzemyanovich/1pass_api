import {
  closeConnection,
  createUser,
  deleteUser,
  deleteUserByPhone,
  getUserByEmail,
  getUserByPhone,
  setVerifed,
} from '../lambda/src/db/utils/repository';
import { getHash, getToken, validateToken } from '../lambda/src/utils/auth';
import { userNotFound } from '../lambda/src/utils/errors';
import { post } from './utils/rest';

describe('sign up + sign in + delete', () => {
  const TEST_TIMEOUT_SEC = 20;
  const { API_URL } = process.env;
  const SIGN_IN_URL = `${API_URL}/sign-in`;
  const SIGN_UP_URL = `${API_URL}/sign-up`;
  const VALIDATE_TOKEN_URL = `${API_URL}/validate-token`;
  const phone = '+12025550156';
  const email = '12025550156@gmail.com';
  const firstName = 'any';
  const lastName = 'any';
  const password = 'password_1';

  it('user workflow', async () => {
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

    const registeredUser = await getUserByPhone(phone);
    expect(registeredUser.firstName).toBe(firstName);
    expect(registeredUser.lastName).toBe(lastName);
    expect(registeredUser.email).toBe(email);
    expect(registeredUser.password).toBe(getHash(password));

    const sinInSuccess: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password,
    });
    const user = await getUserByPhone(phone);
    const token = getToken(user.id as number);

    const validateTokenResult: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token,
    });

    expect(validateTokenResult.success).toBe(true);
    expect(sinInSuccess.success).toBe(true);
    expect(sinInSuccess.data).toBeTruthy();
    expect(validateToken(sinInSuccess.data as string)).toEqual(validateToken(signUpResult.data as string));

    await deleteUser(registeredUser.id as number);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  }, TEST_TIMEOUT_SEC * 1000);

  afterAll(async () => {
    // delete test user in case e2e test fails
    await deleteUserByPhone(phone);
    await closeConnection();
  });
});
