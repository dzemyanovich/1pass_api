import { Table, Column, Model, CreatedAt, UpdatedAt } from 'sequelize-typescript';
// eslint-disable-next-line import/no-cycle
import Booking from './booking';
// eslint-disable-next-line import/no-cycle
import Admin from './admin';
// eslint-disable-next-line import/no-cycle
import SportObjectImage from './sport-object-image';

@Table
export default class SportObject extends Model {
  bookings: Booking[];

  admins: Admin[];

  images: SportObjectImage[];

  @Column
  name: string;

  @Column
  address: string;

  @Column
  lat: number;

  @Column
  long: number;

  @Column
  timeZone: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
