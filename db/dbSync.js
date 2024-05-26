const sequelize = require('../config/connection');
const { Category, Product, Tag, ProductTag } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); 
    console.log('Database synced');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
};

syncDatabase();
