import Api from '@/services/Api'

export default {
  getUser (userId) {
    return Api().get(`/users/${userId}`)
  }
}
