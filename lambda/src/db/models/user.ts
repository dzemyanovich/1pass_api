import { Table, Column, Model, CreatedAt, UpdatedAt, AllowNull, Unique } from 'sequelize-typescript';

@Table
export default class User extends Model {
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
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;
}
