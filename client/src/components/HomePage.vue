<template>
  <v-layout justify-center>
    <v-flex md3 lg4 hidden-sm-and-down>
      <div></div>
    </v-flex>
    <v-flex xs12 sm12 md6 lg4>
    <PostFeed
      :posts="posts"
      :isNewPostAvailable="isNewPostAvailable"
      @reachedBottom="loadMorePosts"/>
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
      isNewPostAvailable: false // TODO
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
    }
  },
  async mounted () {
    // await this.$store.dispatch('setEventSource')
    // this.$store.dispatch('unsetEventSourceChanged')
    let result = await PostService.index()
    await this.addSSEListeners()
    this.posts = result.data
  },
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
