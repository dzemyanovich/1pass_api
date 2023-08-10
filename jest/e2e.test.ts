import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserByPhone,
  setVerifed,
  signUp,
} from '../lambda/src/db/utils/repository';
import { userNotFound } from '../lambda/src/utils/errors';
import { post } from './utils/rest';

describe('sign up + sign in + delete', () => {
  const { API_URL } = process.env;
  const SIGN_IN_URL = `${API_URL}/sign-in`;

  it('user workflow', async () => {
    const phone = '+12025550156';
    const email = '12025550156@gmail.com';
    const firstName = 'any';
    const lastName = 'any';
    const password = 'password_1';

    const sinInFail: EventResult<void> = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(sinInFail.success).toBe(false);
    expect(sinInFail.errors).toContain(userNotFound());

    const createdUser = await createUser(phone);
    const notVerifiedUser = await getUserByPhone(phone);

    expect(notVerifiedUser).toMatchObject(createdUser);
    expect(notVerifiedUser.verified).toBe(false);
    expect(notVerifiedUser.password).toBeFalsy();
    expect(notVerifiedUser.email).toBeFalsy();

    await setVerifed(phone, true);
    const verifiedUser = await getUserByPhone(phone);

    expect(verifiedUser).toMatchObject(createdUser);
    expect(verifiedUser.verified).toBe(true);
    expect(verifiedUser.password).toBeFalsy();
    expect(verifiedUser.email).toBeFalsy();

    const signedUpUser = await signUp({
      phone,
      firstName,
      lastName,
      email,
      confirmEmail: email,
      password,
      confirmPassword: password,
    });

    const registeredUser = await getUserByPhone(phone);
    expect(registeredUser).toMatchObject(signedUpUser);
    expect(registeredUser.password).toBeTruthy();
    expect(registeredUser.email).toBeTruthy();

    const sinInSuccess: EventResult<void> = await post(SIGN_IN_URL, {
      phone,
      password,
    });

    expect(sinInSuccess.success).toBe(true);

    await deleteUser(registeredUser.id);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  });
});
