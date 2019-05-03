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
