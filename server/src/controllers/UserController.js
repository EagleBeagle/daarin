const User = require('../models/User.js')
const mongoose = require('mongoose')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')
const Datauri = require('datauri')
const path = require('path')
const cloudinary = require('cloudinary')

cloudinary.config({ // ezt valahol globalizálni
  cloud_name: 'daarin',
  api_key: '744822548765916',
  api_secret: 'KTogd86JwWJzB0HJUYXI-puj084'
})

module.exports = {
  async getUser (req, res) {
    let userId = req.params.userId
    let sseId = req.user ? req.user.sseId : null
    let data = null
    try {
      let query = User
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(userId)
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'user',
              as: 'reactions'
            }
          },
          {
            $lookup: {
              from: 'posts',
              localField: '_id',
              foreignField: 'createdBy',
              as: 'posts'
            }
          },
          {
            $project: {
              username: 1,
              avatar: 1,
              reactionCount: 1,
              postCount: { $size: '$posts' }
            }
          }
        ])
      data = await query.exec()
      SSEConnectionHandler.setConnectionQuery('user', sseId, query)
      res.status(200).send(data)
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured while fetching the user.'
      })
    }
  },

  async getUserSettings (req, res) {
    let userId = req.user._id
    try {
      let user = await User.findOne({ _id: userId })
      res.status(200).send(user)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured while fetching the user.'
      })
    }
  },

  async changeUserSettings (req, res) {
    let userId = req.params.userId
    let username = req.body.username
    let email = req.body.email
    let oldPassword = req.body.oldPassword
    let newPassword = req.body.newPassword
    let confirmPassword = req.body.confirmPassword
    try {
      if (oldPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          res.status(401).send({
            error: "The new passwords don't match."
          })
        } else {
          let user = await User.findOne({ _id: userId }) // todo validation
          user.comparePassword(oldPassword, async function (err, isMatch) {
            if (isMatch && !err) {
              user.username = username
              user.email = email
              user.password = newPassword
              await user.save()
              res.status(200).send({
                success: true
              })
            } else {
              res.status(401).send({
                error: 'Your old password is not correct.'
              })
            }
          })
        }
      } else {
        await User.findOneAndUpdate({ _id: userId }, {
          username: username,
          email: email
        })
        res.status(200).send({
          success: true
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to change the settings.'
      })
    }
  },

  async changeAvatar (req, res) {
    const dUri = new Datauri()
    dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer)

    try {
      let result = await cloudinary.v2.uploader.upload(dUri.content, {
        folder: 'avatars'
      })
      await User.findOneAndUpdate({ _id: req.user._id }, { avatar: result.url })
      res.status(201).send({ avatar: result.url })
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error occured while changing the avatar'
      })
    }
  }
}
