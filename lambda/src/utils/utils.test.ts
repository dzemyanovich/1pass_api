import { addDays, compareTwoDates, isToday } from './utils';

describe('compareTwoDates', () => {
  it('returns true', () => {
    expect(compareTwoDates('2023-10-04T14:47:50.463Z', '2023-10-03T21:00:33.000Z')).toBe(true);
  });

  it('returns false', () => {
    expect(compareTwoDates('2023-10-04T14:47:50.463Z', '2023-10-03T20:00:33.000Z')).toBe(false);
  });
});

describe('isToday', () => {
  it('returns true #1', () => {
    const today = new Date();
    const result = isToday(today);

    expect(result).toBe(true);
  });

  it('returns true #2', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = isToday(today);

    expect(result).toBe(true);
  });

  it('returns false because tomorrow', () => {
    const tomorrow = addDays(new Date(), 1);
    const result = isToday(tomorrow);

    expect(result).toBe(false);
  });

  it('returns false because yesterday', () => {
    const yesterday = addDays(new Date(), -1);
    const result = isToday(yesterday);

    expect(result).toBe(false);
  });
});
