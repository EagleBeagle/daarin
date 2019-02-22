const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models/User.js')

module.exports = {
  register (req, res) {
    let newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })

    newUser.save(function (err) {
      if (err) {
        if (err.name === 'MongoError') {
          res.status(400).send({
            error: 'This account is already in use.'
          })
        } else {
          console.log(err)
          res.status(400).send({
            error: 'An error has occured creating the account.'
          })
        }
      } else {
        let token = jwt.sign(newUser.toJSON(), config.secret)
        res.status(201).json({ user: newUser, token: token })
      }
    })
  },

  login (req, res) {
    User.findOne({
      username: req.body.username
    }, function (err, user) {
      if (err) {
        res.status(500).send({
          error: 'An error has ocured trying to log in'
        })
      }
      if (!user) {
        res.status(401).send({
          error: 'The login information was incorrect'
        })
      } else {
        user.comparePassword(req.body.password, function (err, isMatch) {
          if (isMatch && !err) {
            let token = jwt.sign(user.toJSON(), config.secret)
            res.json({ success: true, token: token, user: user })
          } else {
            res.status(401).send({
              error: 'The login information was incorrect'
            })
          }
        })
      }
    })
  }
}
