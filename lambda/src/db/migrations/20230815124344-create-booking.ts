import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface, sequelize: Sequelize): Promise<void> {
    await queryInterface.createTable('Bookings', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
      },
      sportObjectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'SportObjects', key: 'id' },
      },
      bookingTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      visitTime: {
        type: DataTypes.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('Bookings');
  },
};
