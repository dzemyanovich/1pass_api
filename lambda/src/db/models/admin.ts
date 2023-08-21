import { Table, Column, Model, CreatedAt, UpdatedAt, Unique, ForeignKey } from 'sequelize-typescript';
// eslint-disable-next-line import/no-cycle
import SportObject from './sport-object';

@Table
export default class Admin extends Model {
  @Unique
  @Column
  username: string;

  @Column
  password: string;

  @ForeignKey(() => SportObject)
  @Column
  sportObjectId: number;

  sportObject: SportObject;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
