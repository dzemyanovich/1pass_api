import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
    await queryInterface.createTable('Admins', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sportObjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'SportObjects', key: 'id' },
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('Admins');
  },
};
