const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'postgres',
  database: process.env.DATABASE || 'reviews',
  port: process.env.PORT || 5432,
})

module.exports = pool;