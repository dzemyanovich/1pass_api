import { Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, Unique } from 'sequelize-typescript';
// eslint-disable-next-line import/no-cycle
import Booking from './booking';

@Table
export default class User extends Model {
  bookings: Booking[];

  @Unique
  @Column
  phone: string;

  @Column
  verified: boolean;

  @AllowNull
  @Unique
  @Column
  email: string;

  @AllowNull
  @Column
  firstName: string;

  @AllowNull
  @Column
  lastName: string;

  @AllowNull
  @Column
  password: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
