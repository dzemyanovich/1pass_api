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
