import Api from '@/services/Api'

export default {
  getUser (userId) {
    return Api().get(`/users/${userId}`)
  },
  getUserSettings (userId) {
    return Api().get(`/users/${userId}/settings`)
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
