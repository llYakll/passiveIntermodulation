const sequelize = require('../config/connection');
const seedCategories = require('../seeds/category-seeds');
const seedProducts = require('../seeds/product-seeds');
const seedTags = require('../seeds/tag-seeds');
const seedProductTags = require('../seeds/product-tag-seeds');

const resetDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('\n----- DATABASE SYNCED -----\n');
    
    await seedCategories();
    console.log('\n----- CATEGORIES SEEDED -----\n');
    
    await seedProducts();
    console.log('\n----- PRODUCTS SEEDED -----\n');
    
    await seedTags();
    console.log('\n----- TAGS SEEDED -----\n');
    
    await seedProductTags();
    console.log('\n----- PRODUCT TAGS SEEDED -----\n');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetDatabase();