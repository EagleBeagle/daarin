const Comment = require('../models/Comment.js')

let connections = {}

module.exports = {
  connections: connections,

  createNewConnection (sseId) {
    let connection = {
      postQuery: null,
      userQuery: null,
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
