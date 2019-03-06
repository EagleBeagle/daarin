// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router/index'
import Vuetify from 'vuetify'
import { sync } from 'vuex-router-sync'
import store from '@/store/store'
import 'vuetify/dist/vuetify.min.css'
import Panel from '@/components/globals/Panel'
import * as Cookies from 'js-cookie'
// import VueCookie from 'vue-cookie'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.prototype.$cookies = Cookies

// Vue.use(VueCookie)

Vue.component('panel', Panel)

sync(store, router)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
