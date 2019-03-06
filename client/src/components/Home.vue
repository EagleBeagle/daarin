<template>
  <v-layout justify-center>
    <v-flex xs4>
      <div v-for="post in posts" :key="post.id">
        <v-flex class="pb-5">
          <post :post="post" />
        </v-flex>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapState} from 'vuex'
import PostService from '@/services/PostService'
import Post from './Post'
export default {
  data () {
    return {
      posts: null,
      eventSource: null
    }
  },
  beforeDestroy () {
    this.eventSource.close()
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user'
    ])
  },
  async mounted () {
    this.setupStream()
    this.posts = (await PostService.index()).data
  },
  methods: {
    setupStream () {
      if (this.user) {
        this.eventSource = new EventSource(`http://localhost:8081/poststream?id=${this.user.sseId}`)
        this.eventSource.addEventListener('message', event => {
          let posts = JSON.parse(event.data)
          console.log(posts)
          this.posts = posts
        })
      } else {
        this.eventSource = new EventSource(`http://localhost:8081/poststream`)
        this.eventSource.addEventListener('messages', event => {
          let posts = JSON.parse(event.data)
          console.log(posts)
          this.posts = posts
        })
      }
    }
    /*
      this.eventSource.addEventListener('error', event => {
        if (event.readyState === EventSource.CLOSED) {
          console.log('Event was closed')
          console.log(EventSource)
        }
      }, false) */
  },
  components: {
    Post
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
