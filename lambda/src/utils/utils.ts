import Booking from '../db/models/booking';
import { MINSK_TIME_ZONE } from './constants';

const locale = 'en-US';

// function is used only for testing
export function compareTwoDates(date1: string, date2: string, timeZone: string = MINSK_TIME_ZONE): boolean {
  const dateString1 = new Date(date1).toLocaleDateString(locale, { timeZone });
  const dateString2 = new Date(date2).toLocaleDateString(locale, { timeZone });

  return dateString1 === dateString2;
}

export function isToday(date: Date, timeZone: string = MINSK_TIME_ZONE): boolean {
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
  return !isToday(booking.bookingTime, booking.sportObject.timeZone) || booking.visitTime;
}

export function getRandomValue<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function daysToMilliseconds(days: number): number {
  return days * 1000 * 60 * 60 * 24;
}

export function delay(sec: number): Promise<unknown> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}
