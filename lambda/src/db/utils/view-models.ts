import Booking from '../models/booking';
import SportObject from '../models/sport-object';
import User from '../models/user';

export function toSportObject(sportObject: SportObject): SportObjectVM {
  const { id, name, address, lat, long } = sportObject;

  return {
    id,
    name,
    address,
    lat,
    long,
  };
}

export function toUserBooking(booking: Booking): UserBooking {
  const { id, sportObject, bookingTime, visitTime } = booking;

  return {
    id,
    sportObject: toSportObject(sportObject),
    bookingTime,
    visitTime,
  };
}

export function toAdminBooking(booking: Booking): AdminBooking {
  const { id, user, bookingTime, visitTime } = booking;

  return {
    id,
    user: toUserVM(user),
    bookingTime,
    visitTime,
  };
}

export function toUserVM(user: User): UserVM {
  const { id, phone, email, firstName, lastName } = user;

  return {
    id,
    phone,
    email,
    firstName,
    lastName,
  };
}
