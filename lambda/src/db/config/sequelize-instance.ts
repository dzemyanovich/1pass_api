import { Sequelize } from 'sequelize-typescript';
import config from './config';
import User from '../models/user';
import Booking from '../models/booking';
import SportObject from '../models/sport-object';
import Admin from '../models/admin';
import SportObjectImage from '../models/sport-object-image';

const sequelizeInstance = new Sequelize(config);

User.hasMany(Booking, { as: 'bookings' });
Booking.belongsTo(User, { as: 'user' });

SportObject.hasMany(Booking, { as: 'bookings' });
Booking.belongsTo(SportObject, { as: 'sportObject' });

SportObject.hasMany(Admin, { as: 'admins' });
Admin.belongsTo(SportObject, { as: 'sportObject' });

SportObject.hasMany(SportObjectImage, { as: 'images' });
SportObjectImage.belongsTo(SportObject, { as: 'sportObject' });

export default sequelizeInstance;
