import Api from '@/services/Api'

export default {
  getUser (userId) {
    return Api().get(`/users/${userId}`)
  },
  getUsersAdmin () {
    return Api().get(`/admin/users`)
  },
  setAsAdmin (userId) {
    return Api().put(`/users/${userId}/admin`)
  },
  unsetAdmin (userId) {
    return Api().delete(`/users/${userId}/admin`)
  },
  getUserSettings (userId) {
    return Api().get(`/users/${userId}/settings`)
  },
  delete (userId) {
    return Api().delete(`/users/${userId}`)
  },
  changeAvatar (formData, userId) {
    return Api().put(`users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  changeUserSettings (userId, settings) {
    return Api().put(`users/${userId}/settings`, settings)
  }
}
