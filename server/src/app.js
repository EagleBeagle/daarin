const express = require('express')
const sse = require('./config/sse')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
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

app.use(cors({
  credentials: true,
  origin: 'http://localhost:8080'
}))
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.use(bodyParser.json())
app.use(cookieParser())
app.use(sse)

app.use(session({
  key: 'user_sid',
  secret: 'daarinsecret', // TODO: beállítani environment variabléra
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    expires: 60000
  }
}))
app.use((req, res, next) => {
  console.log('MIDDLEWARE: ' + req.cookies.user_sid + ', ' + req.session.username)
  if (req.cookies.user_sid && !req.session.username) {
    res.clearCookie('user_sid')
  }
  next()
})

require('./config/passport')
require('./routes')(app)

module.exports = app
