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
    closeComments: false,
    eventSource: null,
    eventSourceChanged: false,
    replyStreamCb: null,
    replyStreamExists: false,
    replyStreamFlag: false,
    replyStreamData: null,
    localReply: null
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
    changeUserAvatar (state, avatar) {
      state.user.avatar = avatar
      console.log(state.user.avatar)
    },
    closeComments (state) {
      state.closeComments = !state.closeComments
    },
    updateEventSource (state, eventSource) {
      state.eventSource = eventSource
    },
    closeEventSource (state) {
      state.eventSource = null
    },
    setEventSourceChanged (state) {
      state.eventSourceChanged = !state.eventSourceChanged
    },
    setReplyStreamCb (state, replyStreamCb) {
      state.replyStreamCb = replyStreamCb
    },
    setReplyStreamExists (state, replyStreamExists) {
      state.replyStreamExists = replyStreamExists
    },
    alternateReplyStreamFlag (state) {
      state.replyStreamFlag = !state.replyStreamFlag
    },
    setReplyStreamData (state, data) {
      state.replyStreamData = data
    },
    setLocalReply (state, reply) {
      state.localReply = reply
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
    changeUserAvatar ({commit}, avatar) {
      commit('changeUserAvatar', avatar)
    },
    closeComments ({commit}) {
      commit('closeComments')
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
    },
    async addReplyListener ({commit}) {
      if (this.state.user) {
        let replyStreamCb = (event) => {
          let data = JSON.parse(event.data)
          commit('alternateReplyStreamFlag')
          commit('setReplyStreamData', data)
        }
        commit('setReplyStreamCb', replyStreamCb)
        this.state.eventSource.addEventListener('reply', replyStreamCb)
        commit('setReplyStreamExists', true)
      }
    },
    removeReplyListener ({commit}) {
      if (this.state.replyStreamExists) {
        this.state.eventSource.removeEventListener('reply', this.state.replyStreamCb)
      }
      commit('setReplyStreamExists', null)
    },
    setLocalReply ({commit}, reply) {
      commit('setLocalReply', reply)
    }
  }
})
