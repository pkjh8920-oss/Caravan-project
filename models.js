const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // 파일로 DB 저장
  logging: false
});

// 1. User 모델
const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('HOST', 'GUEST'), defaultValue: 'GUEST' },
  reliability: { type: DataTypes.FLOAT, defaultValue: 3.0 }
});

// 2. Caravan 모델
const Caravan = sequelize.define('Caravan', {
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  amenities: { type: DataTypes.TEXT, allowNull: true }, // "WiFi, BBQ" 등 텍스트로 저장
  image: { type: DataTypes.STRING, defaultValue: 'https://placehold.co/600x400' },
  status: { type: DataTypes.ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE'), defaultValue: 'AVAILABLE' }
});

// 3. Booking 모델
const Booking = sequelize.define('Booking', {
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  totalPrice: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'PAID'), defaultValue: 'PENDING' }
});

// 4. Review 모델
const Review = sequelize.define('Review', {
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: false }
});

// 관계 설정 (Associations)
User.hasMany(Caravan, { foreignKey: 'hostId' });
Caravan.belongsTo(User, { as: 'host', foreignKey: 'hostId' });

User.hasMany(Booking, { foreignKey: 'guestId' });
Booking.belongsTo(User, { as: 'guest', foreignKey: 'guestId' });

Caravan.hasMany(Booking, { foreignKey: 'caravanId' });
Booking.belongsTo(Caravan, { foreignKey: 'caravanId' });

User.hasMany(Review, { foreignKey: 'guestId' });
Caravan.hasMany(Review, { foreignKey: 'caravanId' });
Review.belongsTo(User, { as: 'guest', foreignKey: 'guestId' });

module.exports = { sequelize, User, Caravan, Booking, Review };