export function expectSportObject(sportObject: SportObjectVM): void {
  expect(sportObject).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    address: expect.any(String),
    lat: expect.any(Number),
    long: expect.any(Number),
  });
}
