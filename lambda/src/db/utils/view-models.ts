import Booking from '../models/booking';
import SportObject from '../models/sport-object';

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

export function toBooking(booking: Booking): BookingVM {
  const { id, userId, sportObjectId, bookingTime, visitTime } = booking;

  return {
    id,
    userId,
    sportObjectId,
    bookingTime,
    visitTime,
  };
}
