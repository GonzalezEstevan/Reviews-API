const express = require('express');
const app = express();
const pool = require('./db')
const router = require('./routers.js')
const PORT = 3001;
const morgan = require('morgan');

app.use(express.json()) //gives us req.body
app.use(morgan('dev'))

app.use('/api', router)


app.listen(PORT, () => {
  console.log(`Server Is Listening on PORT: ${PORT} ;)`)
})