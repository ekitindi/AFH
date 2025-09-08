// backend/src/config/database.js
/**
 * Database connection configuration using Knex
 */

const knex = require('knex');
const knexConfig = require('../../knexfile');

// Get environment (development or production)
const environment = process.env.NODE_ENV || 'development';

// Create database connection
const db = knex(knexConfig[environment]);

// Test database connection
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = db;