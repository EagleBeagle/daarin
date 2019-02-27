const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./config/config')

const app = express()
app.listen(config.port)
mongoose.Promise = require('bluebird')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/daarindb', {
  useNewUrlParser: true,
  promiseLibrary: require('bluebird')
})
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connection succesful')
    }
  })
  .catch((err) => console.error(err))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

app.use(bodyParser.json())
app.use(cors())

require('./config/passport')
require('./routes')(app)

module.exports = app
