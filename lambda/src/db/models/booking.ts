import { Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, ForeignKey } from 'sequelize-typescript';
// eslint-disable-next-line import/no-cycle
import SportObject from './sport-object';
// eslint-disable-next-line import/no-cycle
import User from './user';

@Table
export default class Booking extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  user: User;

  @ForeignKey(() => SportObject)
  @Column
  sportObjectId: number;

  sportObject: SportObject;

  @Column
  bookingTime: Date;

  @AllowNull
  @Column
  visitTime: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
