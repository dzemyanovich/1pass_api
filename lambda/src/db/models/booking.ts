import { Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, ForeignKey } from 'sequelize-typescript';
import SportObject from './sport-object';
import User from './user';

@Table
export default class Booking extends Model {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @ForeignKey(() => SportObject)
  @Column
  sportObjectId: number;

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
