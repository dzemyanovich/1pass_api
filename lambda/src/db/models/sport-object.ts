import { Table, Column, Model, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table
export default class SportObject extends Model {
  @Column
  name: string;

  @Column
  address: string;

  @Column
  lat: number;

  @Column
  long: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
