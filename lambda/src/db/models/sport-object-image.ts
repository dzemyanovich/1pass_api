import { Table, Column, Model, CreatedAt, UpdatedAt, ForeignKey } from 'sequelize-typescript';
// eslint-disable-next-line import/no-cycle
import SportObject from './sport-object';

@Table
export default class SportObjectImage extends Model {
  @ForeignKey(() => SportObject)
  @Column
  sportObjectId: number;

  sportObject: SportObject;

  @Column
  url: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
