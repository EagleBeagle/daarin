import axios from 'axios'
import store from '@/store/store'

axios.defaults.withCredentials = true

export default () => {
  return axios.create({
    baseURL: `http://localhost:8081/`,
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${store.state.token}`
    }
  })
}
