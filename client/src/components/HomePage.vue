<template>
  <v-layout justify-center>
    <v-flex md3 lg4 hidden-sm-and-down>
      <div></div>
    </v-flex>
    <v-flex xs12 sm12 md6 lg4>
    <PostFeed
      :posts="posts"
      :isNewPostAvailable="isNewPostAvailable"
      @reachedBottom="loadMorePosts"
      @filter-post="filterPost"/>
    </v-flex>
    <v-flex md3 lg4 hidden-sm-and-down>
      <div></div>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapState} from 'vuex'
import PostService from '@/services/PostService'
import PostFeed from './PostFeed'
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
      savedScrollPos: null
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
      'eventSourceChanged'
    ])
  },
  watch: {
    async eventSourceChanged (val, oldVal) {
      console.log('EVENT SOURCE VÁLTOZOTT, reloadolunk')
      await this.addSSEListeners()
    },
    async '$route' (to, from) {
      console.log(from)
      console.log(to)
      let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      }
      if (from.name === 'postPage' && to.name === 'home' && this.hiddenPosts[this.filteredPostIndex] && this.hiddenPosts[this.filteredPostIndex]._id === this.posts[0]._id && this.hiddenPosts.length > 1) {
        // this.hiddenPosts.splice(this.filteredPostIndex, 0, this.posts[0])
        // let copy = JSON.parse(JSON.stringify(this.hiddenPosts))
        // let filteredPost = this.posts[0] // ?
        // let upper = copy.slice(0, this.filteredPostIndex)
        // let lower = copy.slice(this.filteredPostIndex, copy.length)
        // this.posts = [...this.posts, ...this.hiddenPosts]
        // this.posts = [...this.posts, ...lower]
        this.hiddenPosts[this.filteredPostIndex] = this.posts[0]
        this.posts = JSON.parse(JSON.stringify(this.hiddenPosts))
        this.hiddenPosts = []
      } else if (from.name === 'home' && to.name === 'postPage' && this.hiddenPosts[this.filteredPostIndex] && this.hiddenPosts[this.filteredPostIndex]._id === this.posts[0]._id) {
      } else if (from.name === 'home' && to.name === 'home') {
        await this.getPosts()
      } else if (from.name === 'home' && to.name === 'postPage') {
        await this.getPost()
      } else if (from.name === 'postPage' && to.name === 'postPage') {
        if (from.params.postId !== to.params.postId) {
          await this.getPost()
        }
      } else if (from.name === 'postPage' && to.name === 'home') {
        await this.getPosts()
        console.log('itt kéne lennünk')
      }
      console.log(this.filteredPostIndex)
      setTimeout(() => {
        let postElements = document.getElementsByClassName('post')
        for (let element of postElements) {
          element.style.width = ''
        }
      }, 600)
    }
  },
  async mounted () {
    // await this.$store.dispatch('setEventSource')
    // this.$store.dispatch('unsetEventSourceChanged')
    // document.getElementsByTagName('html')[0].style.overflow = 'auto'
    // let result
    // if (!this.posts) {
    if (this.$route.params.postId) {
      await this.getPost()
    } else { // külön method
      await this.getPosts()
      await this.addSSEListeners()
    }
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
          this.posts.forEach(function (post) {
            let streamedReactsOfPost = streamedReacts.find(streamedReact => streamedReact._id === post._id)
            if (streamedReactsOfPost) {
              post.reactions = streamedReactsOfPost.reactions
            } else {
              post.reactions = []
            }
            return post
          })
          /* if (streamedPosts.length > this.posts.length) { // TODO
            this.isNewPostAvailable = true
            console.log('VAN ÚJ')
          } */
          console.log(streamedReacts)
        }
        this.postStreamEvent = 'post'
        this.eventSource.addEventListener(this.postStreamEvent, this.postStreamCb)
      } else {
        this.postStreamCb = (event) => {
          let data = JSON.parse(event.data)
          console.log(data)
        }
        this.postStreamEvent = 'message'
        this.$store.state.eventSource.addEventListener(this.postStreamEvent, this.postStreamCb)
      }
      // this.$store.dispatch('closeEventSource')
    },
    async getPost () {
      try {
        let result = await PostService.getPost(this.$route.params.postId)
        this.posts = [result.data[0]]
      } catch (error) {
        console.log(error)
      }
    },
    async getPosts () {
      try {
        let result = await PostService.index()
        this.posts = result.data
      } catch (error) {
        console.log(error)
      }
    },
    async loadMorePosts () {
      if (this.posts) {
        let lastPost = this.posts[Object.keys(this.posts).length - 1]
        let morePosts = (await PostService.index(lastPost, 5)).data
        for (let newPost of morePosts) {
          this.posts.push(newPost)
        }
        console.log(this.posts)
      }
    },
    filterPost (post) {
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
      this.savedScrollPos = document.documentElement.scrollTop
      this.posts = []
      this.posts.push(post)
      // document.getElementsByTagName('html')[0].style.overflow = 'auto'
      // postElement.style.width = 'inherit'
    }
  },
  components: {
    PostFeed
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
