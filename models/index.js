'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

const db = {};

// Load models
const userModel = require('./user')(sequelize, DataTypes);
const caravanModel = require('./caravan')(sequelize, DataTypes);
const bookingModel = require('./booking')(sequelize, DataTypes);
const reviewModel = require('./review')(sequelize, DataTypes);

db[userModel.name] = userModel;
db[caravanModel.name] = caravanModel;
db[bookingModel.name] = bookingModel;
db[reviewModel.name] = reviewModel;

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
