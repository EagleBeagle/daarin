<template>
  <v-container>
    <v-layout class="userInfo"></v-layout>
    <transition name ="fade">
      <UserPage class="userInfo" v-if="onUserPage" @switchedTab="getPostsOfUser"/>
    </transition>
    <v-layout justify-center>
      <v-flex v-show="showPostInfo" md3 lg4 hidden-sm-and-down>
      </v-flex>
      <v-flex xs12 sm12 md6 lg4>
      <PostFeed
        :posts="posts"
        :isNewPostAvailable="isNewPostAvailable"
        @reachedBottom="loadMorePosts"
        @filter-post="filterPost"/>
      </v-flex>
      <v-flex v-show="showPostInfo" md3 lg4 hidden-sm-and-down>
        <transition name="fadeRight">
            <PieChart class="postChart" v-if="showPostInfo && posts && posts[0] && posts[0].reactions" :chart-data="chartData" />
        </transition>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {mapState} from 'vuex'
import PostService from '@/services/PostService'
import PostFeed from './PostFeed'
import UserPage from './UserPage'
import PieChart from '../PieChart.js'
export default {
  data () {
    return {
      posts: null,
      postStreamCb: null,
      postStreamEvent: null, // később több is lehet belőle
      isNewPostAvailable: false, // TODO
      hiddenPosts: [],
      filteredPost: null,
      filteredPostIndex: null,
      onUserPage: false,
      savedScrollPos: null,
      showPostInfo: false,
      chartData: null,
      canLoadMorePosts: true,
      userPageTab: 0
    }
  },
  beforeDestroy () {
    this.eventSource.removeEventListener(this.postStreamEvent, this.postStreamCb)
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user',
      'eventSource',
      'eventSourceChanged',
      'deletedPost',
      'requestSnackbar',
      'search'
    ]),
    sortedReactions: function () {
      if (this.posts && this.posts[0] && this.posts[0].reactions) {
        let sortedReactions = [0, 0, 0, 0, 0, 0, 0]
        this.posts[0].reactions.forEach((reaction) => {
          sortedReactions[reaction.type] += 1
        })
        return sortedReactions
      }
    }
  },
  watch: {
    sortedReactions (val) {
      this.chartData = {
        labels: [ 'Funny', 'Informative', 'Smart', 'Cute', 'Controversial', 'Creative', 'Entertaining' ],
        datasets: [
          {
            backgroundColor: ['#FFCA28', '#9CCC65', '#8D6E63', '#F48FB1', '#E57373', '#9575CD', '#4FC3F7'],
            borderColor: '#ECEFF1',
            borderAlign: 'inner',
            borderWidth: 4,
            weight: 2,
            data: val
          }
        ]
      }
    },
    '$route.query.query': {
      immediate: true,
      async handler (text) {
        if (text) {
          await this.searchPosts(text)
        }
      }
    },
    async eventSourceChanged (val, oldVal) {
      console.log('EVENT SOURCE VÁLTOZOTT, reloadolunk')
      await this.addSSEListeners()
    },
    async '$route' (to, from) {
      let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      }
      if (to.name === 'postPage') {
        this.showPostInfo = true
      } else {
        this.showPostInfo = false
      }
      if (to.name === 'userPage') {
        this.onUserPage = true
      } else {
        this.onUserPage = false
      }
      if (to.name === 'userPage') {
        this.canLoadMorePosts = false
        // this.posts = []
        // this.posts = await this.getPostsOfUser('own')
        this.userPageTab = 0
        setTimeout(() => {
          this.canLoadMorePosts = true
        }, 1000)
      }

      if (from.name === 'userPage' && to.name !== 'postPage') {
        this.post = []
      }
      if (from.name === 'userPage' && to.name === 'userPage') {
        if (from.params.userId !== to.params.userId) {
          this.onUserPage = false
          setTimeout(() => {
            this.onUserPage = true
          }, 1)
        }
      }

      if (from.name === 'postPage' && to.name !== 'postPage' && to.name !== 'userPage' && this.posts && this.posts[0] && this.hiddenPosts[this.filteredPostIndex] && this.hiddenPosts[this.filteredPostIndex]._id === this.posts[0]._id && this.hiddenPosts.length > 1) {
        // this.hiddenPosts.splice(this.filteredPostIndex, 0, this.posts[0])
        // let copy = JSON.parse(JSON.stringify(this.hiddenPosts))
        // let filteredPost = this.posts[0] // ?
        // let upper = copy.slice(0, this.filteredPostIndex)
        // let lower = copy.slice(this.filteredPostIndex, copy.length)
        // this.posts = [...this.posts, ...this.hiddenPosts]
        // this.posts = [...this.posts, ...lower]
        console.log('itvtadsa')
        this.hiddenPosts[this.filteredPostIndex] = this.posts[0]
        this.posts = JSON.parse(JSON.stringify(this.hiddenPosts))
        this.hiddenPosts = []
      } else if (from.name !== 'postPage' && to.name === 'postPage' && this.hiddenPosts[this.filteredPostIndex] && this.hiddenPosts[this.filteredPostIndex]._id === this.posts[0]._id) {
      } else if (from.name !== 'postPage' && to.name === 'home') {
        this.posts = []
        await this.getPosts()
      } else if (from.name !== 'postPage' && to.name === 'postPage') {
        await this.getPost()
      } else if (from.name === 'postPage' && to.name === 'postPage') {
        if (from.params.postId !== to.params.postId) {
          await this.getPost()
        }
      } else if (from.name !== 'home' && to.name === 'home') {
        await this.getPosts()
      }
      setTimeout(() => {
        let postElements = document.getElementsByClassName('post')
        for (let element of postElements) {
          element.style.width = ''
        }
      }, 600)
    },
    async deletedPost (newVal, oldVal) {
      if (newVal && (oldVal !== newVal)) {
        if (this.$route.name !== 'postPage') {
          this.posts = this.posts.filter(post => post._id !== this.deletedPost)
        } else {
          this.$router.push('/home')
          this.posts = []
          await this.getPosts()
        }
      }
    }
  },
  async mounted () {
    // await this.$store.dispatch('setEventSource')
    // this.$store.dispatch('unsetEventSourceChanged')
    // document.getElementsByTagName('html')[0].style.overflow = 'auto'
    // let result
    // if (!this.posts) {
    if (this.$route.params.postId) {
      this.showPostInfo = true
      await this.getPost()
    } else if (this.$route.params.userId) {
      this.onUserPage = true
      // await this.getPostsOfUser('own')
    } else { // külön method
      await this.getPosts()
    }
    await this.addSSEListeners()
    // }
    // if (!this.posts) {
    // }
  },
  /* beforeRouteEnter (to, from, next) {
    next(vm => {
      console.log('ASDSADASDASDSADSADASASAS')
      console.log(vm.posts)
      if (from.name === 'postPage') {
        vm.$root.hiddenPosts.splice(vm.$root.filteredPostIndex, 0, vm.$root.posts[0])
      }
      vm.$root.posts = JSON.parse(JSON.stringify(vm.$root.hiddenPosts))
      vm.$root.hiddenPosts = []
    })
  }, */
  methods: {
    async addSSEListeners () {
      // await this.$store.dispatch('setEventSource')
      if (this.user) {
        this.postStreamCb = (event) => {
          let streamedReacts = JSON.parse(event.data)
          if (this.posts && this.posts[0]) {
            this.posts.forEach(function (post) {
              let streamedReactsOfPost = streamedReacts.find(streamedReact => streamedReact._id === post._id)
              if (streamedReactsOfPost) {
                post.reactions = streamedReactsOfPost.reactions
              } else {
                post.reactions = []
              }
              return post
            })
          }
          console.log(streamedReacts)
          /* if (streamedPosts.length > this.posts.length) { // TODO
            this.isNewPostAvailable = true
            console.log('VAN ÚJ')
          } */
        }
        this.postStreamEvent = 'post'
        this.eventSource.addEventListener(this.postStreamEvent, this.postStreamCb)
      } else {
        this.postStreamCb = (event) => {
          let data = JSON.parse(event.data)
          console.log(data)
        }
        this.postStreamEvent = 'message'
        this.eventSource.addEventListener(this.postStreamEvent, this.postStreamCb)
      }
      // this.$store.dispatch('closeEventSource')
    },
    async getPost () {
      console.log('getPost')
      try {
        let result = await PostService.getPost(this.$route.params.postId)
        this.posts = [result.data[0]]
      } catch (error) {
        console.log(error)
      }
    },
    async getPosts () {
      console.log('getPosts')
      try {
        let result = await PostService.getPosts()
        this.posts = result.data
      } catch (error) {
        console.log(error)
      }
    },
    async loadMorePosts () {
      console.log('loadMorePosts')
      if (this.posts && this.canLoadMorePosts) {
        let lastPost = this.posts[Object.keys(this.posts).length - 1]
        let morePosts = null
        if (this.$route.name === 'home') {
          morePosts = (await PostService.getPosts(lastPost, 5)).data
        } else if (this.$route.name === 'userPage') {
          if (this.userPageTab === 0) {
            morePosts = (await PostService.getPostsOfUser({
              userId: this.$route.params.userId,
              lastPost: lastPost
            })).data
          } else if (this.userPageTab === 1) {
            morePosts = (await PostService.getReactedPostsOfUser({
              userId: this.$route.params.userId,
              lastPost: lastPost
            })).data
          } else if (this.userPageTab === 2) {
            morePosts = (await PostService.getCommentedPostsOfUser({
              userId: this.$route.params.userId,
              lastPost: lastPost
            })).data
          }
        } else if (this.$route.name === 'search') {
          let text = this.$route.query.query
          if (text) {
            morePosts = (await PostService.searchPosts(text, lastPost)).data
          }
        }
        for (let newPost of morePosts) {
          this.posts.push(newPost)
        }
      }
    },
    filterPost (post) {
      console.log('filterPost')
      this.filteredPost = post
      /* let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      } */
      this.hiddenPosts = JSON.parse(JSON.stringify(this.posts))
      this.posts.forEach((localPost, index) => {
        if (localPost._id === post._id) {
          this.filteredPostIndex = index
        }
      })
      // this.hiddenPosts.splice(this.filteredPostIndex, 1)
      this.savedScrollPos = document.documentElement.scrollTop // probably nem kell
      this.posts = []
      this.posts.push(post)
      // document.getElementsByTagName('html')[0].style.overflow = 'auto'
      // postElement.style.width = 'inherit'
    },
    async searchPosts () {
      console.log('searchPosts')
      let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      }
      try {
        this.posts = null
        let response = null
        let text = this.$route.query.query
        response = await PostService.searchPosts(text, this.lastPost)
        this.posts = response.data
      } catch (err) {
        console.log(err)
      }
      setTimeout(() => {
        let postElements = document.getElementsByClassName('post')
        for (let element of postElements) {
          element.style.width = ''
        }
      }, 600)
    },
    async getPostsOfUser (type) {
      console.log('getPostsOfUser')
      let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      }
      try {
        this.posts = null
        let response = null
        if (type === 'own') {
          this.userPageTab = 0
          response = await PostService.getPostsOfUser({
            userId: this.$route.params.userId
          })
        } else if (type === 'reacted') {
          this.userPageTab = 1
          response = await PostService.getReactedPostsOfUser({
            userId: this.$route.params.userId
          })
        } else if (type === 'commented') {
          this.userPageTab = 2
          response = await PostService.getCommentedPostsOfUser({
            userId: this.$route.params.userId
          })
        }
        this.posts = response.data
      } catch (err) {
        console.log(err)
      }
      setTimeout(() => {
        let postElements = document.getElementsByClassName('post')
        for (let element of postElements) {
          element.style.width = ''
        }
      }, 600)
    }
  },
  components: {
    PostFeed,
    UserPage,
    PieChart
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.userInfo {
  max-height: 403px;
}
.postChart {
  animation-delay: 150ms;
}
.fade-enter-active {
  transition: max-height .5s;
  animation-duration: 300ms;
}
.fade-leave-active {
  transition: max-height .5s;
  animation-duration: 1ms;
}

.fade-enter, .fade-leave-to {
  max-height: 0;
}
</style>
