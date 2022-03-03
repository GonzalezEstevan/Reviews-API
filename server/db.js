const Pool = require('pg').Pool

const pool = new Pool({
  host: 'localhost',
  database: 'reviews',
  port: 5432,
})

module.exports = pool;