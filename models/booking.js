'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'guest' });
      Booking.belongsTo(models.Caravan, { foreignKey: 'caravanId', as: 'caravan' });
    }
  }
  Booking.init({
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
      defaultValue: 'PENDING',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    caravanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Caravans',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
