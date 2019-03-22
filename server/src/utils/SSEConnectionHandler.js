let connections = {}

module.exports = {
  connections: connections,

  createNewConnection (sseId) {
    let connection = {
      postQuery: null,
      userQuery: null,
      popupQuery: null,
      errorData: null
    }
    connections[sseId] = connection
  },

  setConnectionQuery (type, sseId, query) {
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
  },

  deleteConnection (sseId) {
    if (sseId) {
      delete connections[sseId]
    }
  }
}
