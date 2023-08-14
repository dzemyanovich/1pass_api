import { Sequelize } from 'sequelize-typescript';
import config from './config';

const sequelizeInstance = new Sequelize(config);

export default sequelizeInstance;
