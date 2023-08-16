import Booking from '../lambda/src/db/models/booking';
import {
  confirmVisit,
  createUser,
  deleteBooking,
  deleteUser,
  deleteUserByPhone,
  getBookingById,
  getUserByEmail,
  getUserByPhone,
  setVerifed,
} from '../lambda/src/db/utils/repository';
import { registeredUser, userPasswords } from '../lambda/src/db/utils/test-users';
import { getHash, getToken, getUserId } from '../lambda/src/utils/auth';
import { alreadyBooked, pastBooking, userNotFound } from '../lambda/src/utils/errors';
import { get, post } from './utils/rest';

const { API_URL } = process.env;
const SIGN_IN_URL = `${API_URL}/sign-in`;
const SIGN_UP_URL = `${API_URL}/sign-up`;
const SPORT_OBJECTS_URL = `${API_URL}/get-sport-objects`;
const VALIDATE_TOKEN_URL = `${API_URL}/validate-token`;
const CREATE_BOOKING_URL = `${API_URL}/create-booking`;
const CANCEL_BOOKING_URL = `${API_URL}/cancel-booking`;
const TEST_TIMEOUT_SEC = 20;

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
    const token = getToken(user.id as number);

    const validateTokenResult: EventResult<void> = await post(VALIDATE_TOKEN_URL, {
      token,
    });

    expect(validateTokenResult.success).toBe(true);
    expect(sinInSuccess.success).toBe(true);
    expect(sinInSuccess.data).toBeTruthy();
    expect(getUserId(sinInSuccess.data as string)).toEqual(getUserId(signUpResult.data as string));

    await deleteUser(newUser.id as number);

    const userByPhone = await getUserByPhone(phone);
    const userByEmail = await getUserByEmail(email);

    expect(userByPhone).toBeFalsy();
    expect(userByEmail).toBeFalsy();
  }, TEST_TIMEOUT_SEC * 1000);

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
      password: userPasswords[phone],
    });

    const sportObjects: SportObjectVM[] = await get(SPORT_OBJECTS_URL);
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
  }, TEST_TIMEOUT_SEC * 1000);

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
      password: userPasswords[phone],
    });
    const sportObjects: SportObjectVM[] = await get(SPORT_OBJECTS_URL);
    const sportObjectId = sportObjects[0].id;
    const token = signInResponse.data;

    const successResponse: EventResult<number> = await post(CREATE_BOOKING_URL, {
      token,
      sportObjectId,
    });
    const bookingId = successResponse.data as number;
    if (bookingId) {
      bookingIds.push(bookingId);
    }

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
    // eslint-disable-next-line no-restricted-syntax
    for (const bookingId of bookingIds) {
      // eslint-disable-next-line no-await-in-loop
      await deleteBooking(bookingId);
    }
  });
});

// todo: test does not work
describe('cancel-booking -> already visited', () => {
  let bookingId: number;

  it('cannot cancel past booking: already visited', async () => {
    const { phone } = registeredUser;
    const signInResponse: EventResult<string> = await post(SIGN_IN_URL, {
      phone,
      password: userPasswords[phone],
    });
    const sportObjects: SportObjectVM[] = await get(SPORT_OBJECTS_URL);
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

    const confirmVisitResult = await confirmVisit(bookingId);
    expect(confirmVisitResult).toBe([1]);

    const response: EventResult<number> = await post(CANCEL_BOOKING_URL, {
      token,
      bookingId,
    });

    expect(response.success).toBe(false);
    expect(response.errors).toContain(pastBooking());

    await deleteBooking(bookingId);
  });

  afterAll(async () => {
    if (bookingId) {
      await deleteBooking(bookingId);
    }
  });
});
