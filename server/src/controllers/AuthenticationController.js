const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models/User.js')
const uuidv4 = require('uuid/v4')

module.exports = {
  async register (req, res) {
    let newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      sseId: uuidv4()
    })
    try {
      await newUser.save()
      let token = jwt.sign(newUser.toJSON(), config.secret)
      res.status(201).json({ user: newUser, token: token })
    } catch (err) {
      if (err.name === 'MongoError') {
        res.status(400).send({
          error: 'This account is already in use.'
        })
      } else {
        console.log(err)
        res.status(500).send({
          error: 'An error has occured creating the account.'
        })
      }
    }
  },

  async login (req, res) {
    try {
      let user = await User.findOne({ username: req.body.username })
      if (!user) {
        res.status(401).send({
          error: 'The login information was incorrect'
        })
      } else {
        user.comparePassword(req.body.password, async function (err, isMatch) {
          if (isMatch && !err) {
            user.sseId = uuidv4()
            await user.save()
            let token = jwt.sign(user.toJSON(), config.secret)
            res.status(200).send({
              success: true,
              token: token,
              user: user
            })
          } else {
            res.status(401).send({
              error: 'The login information was incorrect'
            })
          }
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured trying to log in'
      })
    }
  }
}
