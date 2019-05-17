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
    let sseId = req.query.id
    res.sseSetup()
    if (sseId) {
      SSEConnectionHandler.createNewConnection(sseId)
    }
    console.log('ittvagyunk')
    let postData = null
    let userData = null
    let commentData = null
    let replyData = null
    let popupData = null
    let errorData = null
    let stop = false

    const intervalClear = setIntervalSync(async function () {
      try {
        if (sseId) {
          console.log(sseId)
          let connection = SSEConnectionHandler.connections[sseId]
          if (connection.postQuery) {
            postData = await connection.postQuery.exec()
            console.log('\tpost')
            if (!stop) res.sseSend('post', postData)
          }
          if (connection.userQuery) {
            userData = await connection.userQuery.exec()
            console.log('\tuser')
            if (!stop) res.sseSend('user', userData)
          }
          if (connection.commentQuery) {
            commentData = await connection.commentQuery.exec()
            console.log('\tcomment')
            if (!stop) res.sseSend('comment', commentData)
          }
          if (connection.replyQuery) {
            replyData = await connection.replyQuery.exec()
            console.log('\treply')
            if (!stop) res.sseSend('reply', replyData)
          }
          if (connection.popupQuery) {
            popupData = await connection.popupQuery.exec()
            popupData = await Post.populate(popupData, { path: 'createdBy', select: 'username' })
            console.log('\tpopup')
            if (!stop) res.sseSend('popup', popupData)
          }
          if (!stop) res.sseSend('heartbeat', ':')
        } else {
          console.log('null')
          if (!stop) res.sseSend('message', ':')
        }
      } catch (err) {
        await intervalClear()
        errorData = {
          error: 'an error has occured while streaming data'
        }
        if (!stop) res.sseSend('error', errorData)
        SSEConnectionHandler.deleteConnection(sseId)
        console.log('ittvagyunk ZÁRUNK')
        stop = true
        res.end()
      }
    }, 2000)

    req.on('close', async () => {
      await intervalClear()
      SSEConnectionHandler.deleteConnection(sseId)
      console.log('SSE Connection closed')
      console.log('ittvagyunk ZÁRUNL')
      stop = true
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
