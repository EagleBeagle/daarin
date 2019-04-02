// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router/index'
import Vuetify from 'vuetify'
import Vuebar from 'vuebar'
import Overdrive from 'vue-overdrive'
import checkView from 'vue-check-view'
import { sync } from 'vuex-router-sync'
import store from '@/store/store'
import 'vuetify/dist/vuetify.min.css'
import Panel from '@/components/globals/Panel'

Vue.config.productionTip = false

Vue.use(Vuetify)
Vue.use(Vuebar)
Vue.use(Overdrive)
Vue.use(checkView)

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
