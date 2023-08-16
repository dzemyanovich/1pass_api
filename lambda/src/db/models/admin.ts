import { Table, Column, Model, CreatedAt, UpdatedAt, Unique, ForeignKey } from 'sequelize-typescript';
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

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
