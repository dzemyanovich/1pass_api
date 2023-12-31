import Admin from '../../lambda/src/db/models/admin';

export function expectSportObject(sportObject: SportObjectVM): void {
  expect(sportObject).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    address: expect.any(String),
    lat: expect.any(Number),
    long: expect.any(Number),
  });
}

export function expectAdminData(adminData: AdminData, admin: Admin): void {
  expect(adminData.username).toBe(admin.username);
  expectSportObject(adminData.sportObject);
  expect(adminData.bookings.length).toBeGreaterThan(0);
  adminData.bookings.forEach(({ id, user, bookingTime, visitTime }: AdminBooking) => {
    expect(typeof id).toBe('number');
    expect(user).toMatchObject({
      id: expect.any(Number),
      phone: expect.any(String),
      email: expect.any(String),
      firstName: expect.any(String),
      lastName: expect.any(String),
    });
    expect(Date.parse(bookingTime as unknown as string)).toBeTruthy();
    if (visitTime) {
      expect(Date.parse(visitTime as unknown as string)).toBeTruthy();
    }
  });
}

export function expectSportObjects(userDataResponse: UserDataResponse): void {
  expect(userDataResponse.success).toBe(true);
  expect(userDataResponse.data?.sportObjects.length).toBeGreaterThan(0);
  userDataResponse.data?.sportObjects.forEach((sportObject: SportObjectVM) => expectSportObject(sportObject));
  expect(userDataResponse.data?.bookings).toBeFalsy();
  expect(userDataResponse.data?.userInfo).toBeFalsy();
}

export function expectBooking({ id, sportObject, bookingTime, visitTime }: UserBooking): void {
  expectSportObject(sportObject);
  expect(typeof id).toBe('number');
  expect(Date.parse(bookingTime as unknown as string)).toBeTruthy();
  if (visitTime) {
    expect(Date.parse(visitTime as unknown as string)).toBeTruthy();
  }
}

export function expectSignInSuccess(signInResponse: SignInResponse, hasBookings = true): void {
  expect(signInResponse).toMatchObject({
    success: true,
    data: {
      token: expect.any(String),
      userInfo: {
        phone: expect.any(String),
        email: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
      },
      bookings: expect.any(Array),
    },
  });

  if (hasBookings) {
    expect(signInResponse.data?.bookings?.length).toBeGreaterThan(0);
    signInResponse.data?.bookings?.forEach(expectBooking);
  } else {
    expect(signInResponse.data?.bookings?.length).toBe(0);
  }
}
