import { isToday } from './utils';

describe('isToday', () => {
  it('returns true #1', async () => {
    const today = new Date();
    const result = isToday(today);

    expect(result).toBe(true);
  });

  it('returns true #2', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = isToday(today);

    expect(result).toBe(true);
  });

  it('returns false because tomorrow', async () => {
    const tomorrow = addDays(new Date(), 1);
    const result = isToday(tomorrow);

    expect(result).toBe(false);
  });

  it('returns false because yesterday', async () => {
    const yesterday = addDays(new Date(), -1);
    const result = isToday(yesterday);

    expect(result).toBe(false);
  });
});

function addDays(date: Date, days: number): Date {
  date.setDate(date.getDate() + days);
  return date;
}
