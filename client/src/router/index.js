import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/HomePage'
import Register from '@/components/RegisterPage'
import Login from '@/components/LoginPage'
import store from '@/store/store'
// import PostPage from '@/components/PostPage'

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
      path: '/post/:postId',
      name: 'postPage',
      component: Home
    },
    {
      path: '/users/:userId',
      name: 'userPage',
      component: Home
    },
    {
      path: '*',
      redirect: 'home'
    }
  ]
})

export default router

router.beforeEach(async (to, from, next) => {
  if (!(store.state.eventSource instanceof EventSource)) {
    await store.dispatch('updateEventSource')
  }
  let restrictedPages = []
  if (store.state.user) {
    restrictedPages = ['/login', '/register']
  }
  const unauthorized = restrictedPages.includes(to.path)
  if (unauthorized) {
    return next('/home')
  }

  next()
})
