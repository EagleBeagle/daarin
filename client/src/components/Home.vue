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
      posts: null
    }
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user'
    ])
  },
  async mounted () {
    this.posts = (await PostService.index()).data
  },
  methods: {
    /*  async upvote (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.isUpvoted(post)) {
          await PostService.unUpvote(post._id)
        } else {
          await PostService.upvote(post._id)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async downvote (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.isDownvoted(post)) {
          await PostService.unDownvote(post._id)
        } else {
          await PostService.downvote(post._id)
        }
      } catch (err) {
        console.log(err)
      }
    },
    isUpvoted (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      if (post.likes.includes(this.$store.state.user._id)) {
        return true
      } else {
        return false
      }
    },
    isDownvoted (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      if (post.dislikes.includes(this.$store.state.user._id)) {
        return true
      } else {
        return false
      }
    } */
  },
  components: {
    Post
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
