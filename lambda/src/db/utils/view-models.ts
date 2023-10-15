import Booking from '../models/booking';
import SportObject from '../models/sport-object';
import SportObjectImage from '../models/sport-object-image';
import User from '../models/user';

export function toSportObject(sportObject: SportObject): SportObjectVM {
  const { id, name, address, lat, long, images } = sportObject;

  return {
    id,
    name,
    address,
    lat,
    long,
    images: images
      ? images.map((image: SportObjectImage) => image.url)
      : [],
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

export function toUserInfo(user: User): UserInfo {
  const { firstName, lastName, phone, email } = user;

  return {
    firstName,
    lastName,
    phone,
    email,
  };
}
