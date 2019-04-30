const User = require('../models/User.js')
const mongoose = require('mongoose')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')

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
  }
}
