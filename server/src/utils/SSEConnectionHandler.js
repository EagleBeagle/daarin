const mongoose = require('mongoose')
const Comment = require('../models/Comment.js')
const Reaction = require('../models/Reaction.js')

let connections = {}

module.exports = {
  connections: connections,

  createNewConnection (sseId) {
    let connection = {
      postQuery: null,
      postIDs: new Set(),
      userQuery: null,
      userIDs: new Set(),
      commentQuery: null,
      commentIDs: new Set(),
      replyQuery: null,
      replyIDs: new Set(),
      popupQuery: null,
      errorData: null
    }
    connections[sseId] = connection
  },

  setConnectionQuery (type, sseId, query) {
    console.log('ITTVAGYUNK A SET BE')
    console.log(sseId)
    if (connections[sseId]) {
      switch (type) {
        case 'post':
          connections[sseId].postQuery = query
          console.log('poszt addolva')
          break
        case 'user':
          connections[sseId].userQuery = query
          break
        case 'comment':
          connections[sseId].commentQuery = query
          console.log('komment addolva')
          break
        case 'reply':
          connections[sseId].replyQuery = query
          console.log('reply addolva')
          break
        case 'popup':
          connections[sseId].popupQuery = query
          break
        default:
      }
    }
  },

  async buildAndSetConnectionQuery (type, sseId, data) {
    if (connections[sseId]) {
      let query
      switch (type) {
        case 'post':
          data.forEach((post) => {
            connections[sseId].postIDs.add(post._id)
          })
          connections[sseId].postIDs.forEach((postId) => {
            postId = mongoose.Types.ObjectId(postId)
          }) /*
          query = Reaction
            .find({
              'to': { $in: Array.from(connections[sseId].postIDs) }
            }) */
          query = Reaction
            .aggregate([
              {
                $match: {
                  to: { $in: Array.from(connections[sseId].postIDs) }
                }
              },
              {
                $group: {
                  _id: '$to',
                  reactions: { $push: { user: '$user', type: '$type' } }
                }
              }
            ])
          this.setConnectionQuery(type, sseId, query)
          break
        case 'comment':
          data.forEach((comment) => {
            connections[sseId].commentIDs.add(comment._id)
          })
          query = Comment
            .find({
              '_id': { $in: Array.from(connections[sseId].commentIDs) }
            })
          this.setConnectionQuery(type, sseId, query)
          break
        case 'reply':
          data.forEach((reply) => {
            connections[sseId].replyIDs.add(reply._id)
          })
          query = Comment
            .find({
              '_id': { $in: Array.from(connections[sseId].replyIDs) }
            })
          this.setConnectionQuery(type, sseId, query)
          break
        default:
      }
    }
  },

  flushQuery (type, sseId) {
    if (connections[sseId]) {
      switch (type) {
        case 'user':
          connections[sseId].userIDs.clear()
          break
        case 'post':
          connections[sseId].postIDs.clear()
          break
        case 'comment':
          connections[sseId].commentIDs.clear()
          break
        case 'reply':
          connections[sseId].replyIDs.clear()
          break
        default:
      }
    }
  },

  deleteConnection (sseId) {
    if (sseId) {
      delete connections[sseId]
    }
  }
}
