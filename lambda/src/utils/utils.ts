import Booking from '../db/models/booking';

export function isToday(date: Date): boolean {
  const todaysDate = new Date();

  return date.setHours(0, 0, 0, 0) === todaysDate.setHours(0, 0, 0, 0);
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
