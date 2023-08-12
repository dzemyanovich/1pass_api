import {
  closeConnection,
  createUser,
  deleteUser,
  deleteUserByPhone,
  getUserByEmail,
  getUserByPhone,
  setVerifed,
  signUp,
} from '../lambda/src/db/utils/repository';
import { getHash } from '../lambda/src/utils/auth';
import { userNotFound } from '../lambda/src/utils/errors';
import { post } from './utils/rest';

describe('sign up + sign in + delete', () => {
  const { API_URL } = process.env;
  const SIGN_IN_URL = `${API_URL}/sign-in`;
  const phone = '+12025550156';
  const email = '12025550156@gmail.com';
  const firstName = 'any';
  const lastName = 'any';
  const password = 'password_1';

  it('user workflow', async () => {
    const sinInFail: EventResult<void> = await post(SIGN_IN_URL, {
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

    await signUp({
      phone,
      firstName,
      lastName,
      email,
      confirmEmail: email,
      password,
      confirmPassword: password,
    });

    const registeredUser = await getUserByPhone(phone);
    expect(registeredUser.firstName).toBe(firstName);
    expect(registeredUser.lastName).toBe(lastName);
    expect(registeredUser.email).toBe(email);
    expect(registeredUser.password).toBe(getHash(password));

    const sinInSuccess: EventResult<void> = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(sinInSuccess.success).toBe(true);

    await deleteUser(registeredUser.id as number);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  });

  afterAll(async () => {
    // delete test user in case e2e test fails
    await deleteUserByPhone(phone);
    // todo: do we need to close connection in lambdas?
    await closeConnection();
  });
});
