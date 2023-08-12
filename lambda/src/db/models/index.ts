import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes } from 'sequelize';

import config from '../config/config';

const basename = path.basename(__filename);
const db: any = {};

const sequelize: Sequelize = new Sequelize(
  config.database as string,
  config.username as string,
  config.password,
  config,
);

fs
  .readdirSync(__dirname)
  .filter(file => (
    file.indexOf('.') !== 0
    && file !== basename
    && file.slice(-3) === '.js'
    && file.indexOf('.test.js') === -1))
  .forEach(file => {
    // eslint-disable-next-line max-len
    // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-call
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
