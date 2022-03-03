const express = require('express');
const app = express();
const pool = require('./db')

app.use(express.json()) //gives us req.body

app.listen(5432, () => {
  console.log('Server Is Listening ;)')
})