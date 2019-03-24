import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: true,
  plugins: [
    createPersistedState()
  ],
  state: {
    token: null,
    user: null,
    sseId: null,
    isUserLoggedIn: false,
    eventSource: null,
    eventSourceChanged: false
  },
  mutations: {
    setToken (state, token) {
      state.token = token
      state.isUserLoggedIn = !!(token)
    },
    setSseId (state, sseId) {
      state.sseId = sseId
    },
    setUser (state, user) {
      state.user = user
    },
    updateEventSource (state, eventSource) {
      state.eventSource = eventSource
    },
    closeEventSource (state) {
      state.eventSource = null
    },
    setEventSourceChanged (state) {
      state.eventSourceChanged = !state.eventSourceChanged
    }
  },
  actions: {
    setToken ({commit}, token) {
      commit('setToken', token)
    },
    setSseId ({commit}, sseId) {
      commit('setSseId', sseId)
    },
    setUser ({commit}, user) {
      commit('setUser', user)
    },
    async updateEventSource ({commit}) { // le kell kezelni, hogy ne csináljon többet
      let eventSource = null
      if (this.state.eventSource instanceof EventSource) { // instanceof, mert valamiért nem állítódik nullra
        await this.state.eventSource.close()
        commit('closeEventSource')
      }
      if (this.state.user) {
        eventSource = await new EventSource(`http://localhost:8081/stream?id=${this.state.user.sseId}`)
      } else {
        eventSource = await new EventSource(`http://localhost:8081/stream`)
      }
      commit('setEventSourceChanged')
      commit('updateEventSource', eventSource)
    },
    async closeEventSource ({commit}) {
      await this.state.eventSource.close()
      commit('closeEventSource')
    }
  }
})
