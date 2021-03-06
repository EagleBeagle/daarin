import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/HomePage'
import Register from '@/components/RegisterPage'
import Login from '@/components/LoginPage'
import UserSettings from '@/components/UserSettings'
import VerifyAccount from '@/components/VerifyAccount'
import AdminPage from '@/components/AdminPage'
import ForgotPassword from '@/components/ForgotPassword'
import ResetPassword from '@/components/ResetPassword'
import store from '@/store/store'
// import PostPage from '@/components/PostPage'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/newest',
      name: 'newest',
      component: Home
    },
    {
      path: '/recommended',
      name: 'recommended',
      component: Home
    },
    {
      path: '/trending',
      name: 'trending',
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
      path: '/forgotpassword',
      name: 'forgotPassword',
      component: ForgotPassword
    },
    {
      path: '/resetpassword',
      name: 'resetPassword',
      component: ResetPassword
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
      redirect: '/trending'
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
      return next('/trending')
    }
    restrictedPages = ['/login', '/register', '/forgotpassword', '/resetpassword']
    if (!store.state.user.confirmed) {
      restrictedPages.push('/recommended')
    }
  } else {
    if (to.name === 'adminPage' || to.name === 'userSettings' || to.name === 'recommended') {
      return next('/trending')
    }
  }

  const unauthorized = restrictedPages.includes(to.path)
  if (unauthorized) {
    return next('/trending')
  }

  next()
})
