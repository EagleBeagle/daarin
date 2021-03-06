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
import vue2Animate from 'vue2-animate/dist/vue2-animate.min.css'
import '@fortawesome/fontawesome-free/css/all.css'
import SocialSharing from 'vue-social-sharing'
import VueClipboard from 'vue-clipboard2'
import Affix from 'vue-affix'

Vue.config.productionTip = false

Vue.use(Vuetify, {
  iconfont: 'fa'
})
Vue.use(Vuebar)
Vue.use(Overdrive)
Vue.use(checkView)
Vue.use(vue2Animate)
Vue.use(SocialSharing)
Vue.use(VueClipboard)
Vue.use(Affix)

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
