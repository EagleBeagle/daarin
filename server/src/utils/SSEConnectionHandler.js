let connections = {}

module.exports = {
  connections: connections,

  createNewConnection (sseId) {
    let connection = {
      postQuery: null,
      userQuery: null,
      commentQuery: null,
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
        case 'popup':
          connections[sseId].popupQuery = query
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
