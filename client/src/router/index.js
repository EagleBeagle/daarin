import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Register from '@/components/Register'
import Login from '@/components/Login'
import store from '@/store/store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '*',
      redirect: 'home'
    }
  ]
})

export default router

//  tiltas
router.beforeEach((to, from, next) => {
  let restrictedPages = []
  if (store.state.user) {
    console.log('bejelentkezve')
    restrictedPages = ['/Login', '/Register']
  }
  const unauthorized = restrictedPages.includes(to.path)

  if (unauthorized) {
    return next('/home')
  }

  next()
})
