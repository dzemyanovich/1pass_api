import Booking from '../db/models/booking';

const locale = 'en-US';

// function is used only for testing
export function compareTwoDates(date1: string, date2: string, timeZone = 'Europe/Minsk'): boolean {
  const dateString1 = new Date(date1).toLocaleDateString(locale, { timeZone });
  const dateString2 = new Date(date2).toLocaleDateString(locale, { timeZone });

  return dateString1 === dateString2;
}

export function isToday(date: Date): boolean {
  // todo: get timeZone from sportObject instance
  const timeZone = 'Europe/Minsk';
  const today = new Date();
  const todayDate = today.toLocaleDateString(locale, { timeZone });
  const compareDate = date.toLocaleDateString(locale, { timeZone });

  return todayDate === compareDate;
}

export function addDays(date: Date, days: number): Date {
  date.setDate(date.getDate() + days);
  return date;
}

export function isPastBooking(booking: Booking) {
  return !isToday(booking.bookingTime) || booking.visitTime;
}

export function getRandomValue<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function daysToMilliseconds(days: number): number {
  return days * 1000 * 60 * 60 * 24;
}
