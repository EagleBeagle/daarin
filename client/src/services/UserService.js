import Api from '@/services/Api'

export default {
  getUser (userId) {
    return Api().get(`/users/${userId}`)
  },
  changeAvatar (formData, userId) {
    return Api().put(`users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
