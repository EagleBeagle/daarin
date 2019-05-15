import axios from 'axios'
import store from '@/store/store'

export default () => {
  return axios.create({
    baseURL: `http://172.16.17.219:8081/`,
    headers: {
      Authorization: `Bearer ${store.state.token}`
    }
  })
}
