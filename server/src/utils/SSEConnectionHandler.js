const Comment = require('../models/Comment.js')

let connections = {}

module.exports = {
  connections: connections,

  createNewConnection (sseId) {
    let connection = {
      postQuery: null,
      userQuery: null,
      commentQuery: null,
      commentIDs: [],
      replyQuery: null,
      replyIDs: [],
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

  buildAndSetConnectionQuery (type, sseId, data, flush) {
    if (connections[sseId]) {
      switch (type) {
        case 'comment':
          if (flush) {
            console.log('flusholunk')
            connections[sseId].commentIDs = []
            console.log(connections[sseId].commentIDs)
          }
          data.forEach((comment) => {
            connections[sseId].commentIDs.push(comment._id)
          })
          let query = Comment
            .find({
              '_id': { $in: connections[sseId].commentIDs }
            })
            .populate('createdBy', 'username')
          this.setConnectionQuery(type, sseId, query)
          break
        case 'reply':
          if (flush) {
            connections[sseId].commentIDs = []
          }
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
