const express = require('express')
const { sseMiddleware } = require('./config/sse')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
// const history = require('connect-history-api-fallback')
const mongoSanitize = require('express-mongo-sanitize')
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

// app.use(histoy())
app.use(mongoSanitize())
app.use(bodyParser.json())
app.use(cors())
app.use(sseMiddleware)

require('./config/passport')
require('./routes')(app)

module.exports = app
