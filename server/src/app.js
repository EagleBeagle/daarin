const express = require('express')
const { sseMiddleware } = require('./config/sse')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
// const history = require('connect-history-api-fallback')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const RecommendationSystem = require('./utils/RecommendationSystem')
const config = require('./config/config')

const app = express()
app.listen(config.port)
app.enable('trust proxy')
mongoose.Promise = require('bluebird')
mongoose.set('useCreateIndex', true)
mongoose.connect('mongodb://localhost:27017/daarindb', {
  useNewUrlParser: true,
  promiseLibrary: require('bluebird')
})
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connection succesful')
      RecommendationSystem.start()
    }
  })
  .catch((err) => console.error(err))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000
})
// app.use(histoy())
app.use(limiter)
app.use(mongoSanitize())
app.use(bodyParser.json())
app.use(cors())
app.use(sseMiddleware)

require('./config/passport')
require('./routes')(app)

module.exports = app
