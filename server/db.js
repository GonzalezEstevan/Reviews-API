const Pool = require('pg').Pool
require('dotenv').config()

const pool = new Pool({
  host: process.env.HOST || "54.151.76.180",
  user: process.env.USER || "ubuntu",
  password: process.env.PASSWORD || "ubuntu",
  database: process.env.DATABASE || "reviews",
  port: process.env.PORT || 5432,
})
// const pool = new Pool({
//   host:  "localhost",
//   user:  "estevangonzalez",
//   password:  "notmyname",
//   database:  "reviews",
//   port:  5432,
// })


module.exports = pool;