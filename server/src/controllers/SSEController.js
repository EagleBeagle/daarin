const { setIntervalSync } = require('../utils/common.js')
const Post = require('../models/Post')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler')

/* const createNewSSEConnection = function (sseId) {
  let connection = {
    postQuery: null,
    userQuery: null,
    popupQuery: null,
    errorData: null
  }
  connections[sseId] = connection
} */

module.exports = {
  async stream (req, res) {
    res.sseSetup()
    let sseId = req.query.id
    if (sseId) {
      SSEConnectionHandler.createNewConnection(sseId)
    }
    let postData = null
    let userData = null
    let commentData = null
    let replyData = null
    let popupData = null
    let errorData = null

    const intervalClear = setIntervalSync(async function () {
      try {
        if (sseId) {
          console.log(sseId)
          let connection = SSEConnectionHandler.connections[sseId]
          if (connection.postQuery) {
            postData = await connection.postQuery.exec()
            console.log('\tpost')
            res.sseSend('post', postData)
          }
          if (connection.userQuery) {
            userData = await connection.userQuery.exec()
            console.log('\tuser')
            res.sseSend('user', userData)
          }
          if (connection.commentQuery) {
            commentData = await connection.commentQuery.exec()
            console.log('\tcomment')
            res.sseSend('comment', commentData)
          }
          if (connection.replyQuery) {
            replyData = await connection.replyQuery.exec()
            console.log('\treply')
            res.sseSend('reply', replyData)
          }
          if (connection.popupQuery) {
            popupData = await connection.popupQuery.exec()
            popupData = await Post.populate(popupData, { path: 'createdBy', select: 'username' })
            console.log('\tpopup')
            res.sseSend('popup', popupData)
          }
          res.sseSend('heartbeat', ':')
        } else {
          console.log('null')
          res.sseSend('message', ':')
        }
      } catch (err) {
        errorData = {
          error: 'an error has occured while streaming data'
        }
        res.sseSend('error', errorData)
        await intervalClear()
        SSEConnectionHandler.deleteConnection(sseId)
        res.end()
      }
    }, 3000)

    req.on('close', async () => {
      await intervalClear()
      SSEConnectionHandler.deleteConnection(sseId)
      console.log('SSE Connection closed')
      res.end()
    })
  }

  /* sseConnectionExists(sseId) {
    let sseConnection = connections.find(
      conn => conn.sseId === sseId
    )
    if (sseConnection) {
      return true
    } else {
      return false
    }
  }, */

  /* setConnectionQuery (type, sseId, query) {
    if (connections[sseId]) {
      switch (type) {
        case 'post':
          connections[sseId].postQuery = query
          break
        case 'user':
          connections[sseId].userQuery = query
          break
        case 'popup':
          connections[sseId].popupQuery = query
          break
        default:
      }
    }
  } */
}
