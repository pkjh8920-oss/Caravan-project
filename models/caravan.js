'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Caravan extends Model {
    static associate(models) {
      Caravan.belongsTo(models.User, { foreignKey: 'userId', as: 'host' });
      Caravan.hasMany(models.Booking, { foreignKey: 'caravanId', as: 'bookings' });
      Caravan.hasMany(models.Review, { foreignKey: 'caravanId', as: 'reviews' });
    }
  }
  Caravan.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_per_day: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amenities: {
      type: DataTypes.JSON, // Store amenities as a JSON array of strings
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE'),
      defaultValue: 'AVAILABLE',
    },
    photos: {
      type: DataTypes.JSON, // Store photo URLs as a JSON array of strings
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Caravan',
  });
  return Caravan;
};
