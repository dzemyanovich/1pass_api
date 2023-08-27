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

export function expectAdminData(response: EventResult<AdminData>, admin: Admin): void {
  expect(response.data?.username).toBe(admin.username);
  expectSportObject(response.data?.sportObject as SportObjectVM);
  expect(response.data?.bookings.length).toBeGreaterThan(0);
  response.data?.bookings.forEach(({ id, user, bookingTime, visitTime }: AdminBooking) => {
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
