import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/HomePage'
import Register from '@/components/RegisterPage'
import Login from '@/components/LoginPage'
import UserSettings from '@/components/UserSettings'
import VerifyAccount from '@/components/VerifyAccount'
import AdminPage from '@/components/AdminPage'
import store from '@/store/store'
// import PostPage from '@/components/PostPage'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/search',
      name: 'search',
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
      path: '/users/:userId/settings',
      name: 'userSettings',
      component: UserSettings
    },
    {
      path: '/admin',
      name: 'adminPage',
      component: AdminPage
    },
    {
      path: '/verify',
      name: 'verifyAccount',
      component: VerifyAccount
    },
    {
      path: '*',
      redirect: '/home'
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
    if ((to.name === 'userSettings' && to.params.userId !== store.state.user._id) || (to.name === 'adminPage' && !store.state.user.admin)) {
      return next('/home')
    }
    restrictedPages = ['/login', '/register']
  } else {
    if (to.name === 'adminPage' || to.name === 'userSettings') {
      return next('/home')
    }
  }

  const unauthorized = restrictedPages.includes(to.path)
  if (unauthorized) {
    return next('/home')
  }

  next()
})
