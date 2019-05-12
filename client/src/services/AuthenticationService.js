import Api from '@/services/Api'

export default {
  register (credentials) {
    return Api().post('/register', credentials)
  },
  login (credentials) {
    return Api().post('/login', credentials)
  },
  verify (id) {
    return Api().post(`/verify?id=${id}`)
  },
  forgotPassword (email) {
    return Api().post(`/forgotpassword`, {
      email: email
    })
  },
  resetPassword (id, newPassword) {
    return Api().post(`/resetpassword?id=${id}`, {
      password: newPassword
    })
  }
}
