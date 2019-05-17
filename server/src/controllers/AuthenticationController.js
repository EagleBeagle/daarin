const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../models/User.js')
const uuidv4 = require('uuid/v4')
let nodemailer = require('nodemailer')

let smtpTransport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'daarin.message@gmail.com',
    pass: 'daarin-002'
  }
})

module.exports = {
  async register (req, res) {
    let confirmationId = uuidv4()
    let newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      sseId: uuidv4(),
      confirmationId: confirmationId
    })
    try {
      await newUser.save()
      let token = jwt.sign(newUser.toJSON(), config.secret)
      let confirmationLink = `http://${req.get('host')}/verify?id=${confirmationId}`
      let mailOptions = {
        to: newUser.email,
        subject: `Confirm your brand new Daarin account, ${req.body.username}!`,
        html: `Greetings,<br>Please click <a href="${confirmationLink}">here</a> to start using Daarin to its full potential!`
      }
      await smtpTransport.sendMail(mailOptions)
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

  async verify (req, res) {
    let id = req.query.id
    if (!id) {
      res.status(400).send()
    } else {
      try {
        let user = await User.findOne({ confirmationId: id })
        console.log('asd')
        if (!user) {
          res.status(400).send()
        } else if (user.confirmed) {
          res.status(200).send({
            status: 'verified'
          })
        } else {
          user.confirmed = true
          await user.save()
          res.status(200).send({
            status: 'success',
            user: user._id
          })
        }
      } catch (err) {
        res.status(500).send({
          status: 'failure'
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
  },

  async forgotPassword (req, res) {
    let email = req.body.email
    try {
      let resetId = uuidv4()
      let user = await User.findOneAndUpdate({ email: email }, { resetPasswordId: resetId })
      if (!user) {
        res.status(400).send({
          error: 'No user exists with the provided email.'
        })
      } else {
        let resetLink = `http://${req.get('host')}/resetpassword?id=${resetId}`
        let mailOptions = {
          to: email,
          subject: `Daarin: password reset`,
          html: `Greetings, ${user.username}!<br>Click <a href="${resetLink}">here</a> to reset your Daarin password.`
        }
        await smtpTransport.sendMail(mailOptions)
        res.status(200).send({
          success: true
        })
      }
    } catch (err) {
      res.status(500).send({
        error: 'An error has happened during password reset.'
      })
    }
  },

  async resetPassword (req, res) {
    let id = req.query.id
    let password = req.body.password
    try {
      let user = await User.findOne({ resetPasswordId: id })
      user.password = password
      user.resetPasswordId = null
      await user.save()
      res.status(200).send({
        success: true
      })
    } catch (err) {
      res.status(500).send({
        error: 'Invalid Link.'
      })
    }
  }
}
