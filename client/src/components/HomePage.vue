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
    '$route' (to, from) {
      console.log(from)
      if (from.name === 'postPage') {
        this.hiddenPosts.splice(this.filteredPostIndex, 0, this.posts[0])
        // let copy = JSON.parse(JSON.stringify(this.hiddenPosts))
        // let filteredPost = this.posts[0] // ?
        // let upper = copy.slice(0, this.filteredPostIndex)
        // let lower = copy.slice(this.filteredPostIndex, copy.length)
        // this.posts = [...this.posts, ...this.hiddenPosts]
        // this.posts = [...this.posts, ...lower]
        this.posts = JSON.parse(JSON.stringify(this.hiddenPosts))
        this.hiddenPosts = []
      } else if (from === 'home' && to === 'postPage') {

      }
    }
  },
  async mounted () {
    // await this.$store.dispatch('setEventSource')
    // this.$store.dispatch('unsetEventSourceChanged')
    // document.getElementsByTagName('html')[0].style.overflow = 'auto'
    // let result
    // if (!this.posts) {
    let result = await PostService.index()
    // }
    await this.addSSEListeners()
    // if (!this.posts) {
    this.posts = result.data
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
          let streamedPosts = JSON.parse(event.data)
          this.posts.forEach(function (post) {
            let streamedPost = streamedPosts.find(streamedPost => streamedPost._id === post._id)
            if (streamedPost) {
              post.likes = streamedPost.likes
              post.dislikes = streamedPost.dislikes
            }
            return post
          })
          if (streamedPosts.length > this.posts.length) { // TODO
            this.isNewPostAvailable = true
            console.log('VAN ÚJ')
          }
          console.log(streamedPosts)
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
      let postElements = document.getElementsByClassName('post')
      for (let element of postElements) {
        element.style.width = element.clientWidth + 'px'
      }
      this.hiddenPosts = JSON.parse(JSON.stringify(this.posts))
      this.posts.forEach((localPost, index) => {
        if (localPost._id === post._id) {
          this.filteredPostIndex = index
        }
      })
      this.hiddenPosts.splice(this.filteredPostIndex, 1)
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
