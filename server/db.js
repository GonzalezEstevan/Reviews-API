const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
  host: process.env.HOST || "54.241.172.189",
  user: process.env.USER || "postgres",
  password: process.env.PASSWORD || "notmyname"
  database: process.env.DATABASE || "reviews",
  port: process.env.PORT || 5432,
})

module.exports = pool;