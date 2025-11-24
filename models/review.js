'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      Review.belongsTo(models.Caravan, { foreignKey: 'caravanId' });
      Review.belongsTo(models.Booking, { foreignKey: 'bookingId' });
    }
  }
  Review.init({
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
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
    caravanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Caravans',
        key: 'id',
      },
    },
    bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Bookings',
            key: 'id',
        },
    }
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
