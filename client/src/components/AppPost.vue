<template>
  <v-flex xs12 class="pb-5">
    <v-card>
      <div>
        <h1 class="bold blue--text">{{ post.title }}</h1>
        <p class="light-blue--text">{{ post.createdBy.username }}</p>
      </div>
      <v-divider/>
      <v-img :src="post.url" width="100%"/>
      <v-divider/>
      <v-card-title>
          <v-btn
            @click="upvote()">
            <v-icon :class="[ upvoted ? 'light-blue--text' : 'grey--text' ]">arrow_upward</v-icon></v-btn>
          <v-btn
            @click="downvote()">
            <v-icon :class="[ downvoted ? 'light-blue--text' : 'grey--text' ]">arrow_downward</v-icon></v-btn>
          <h3>{{ post.likes.length - post.dislikes.length }}</h3>
      </v-card-title>
    </v-card>
  </v-flex>
</template>

<script>
import {mapState} from 'vuex'
import PostService from '@/services/PostService'
export default {
  props: [
    'post'
  ],
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user'
    ]),
    upvoted: function () {
      if (!this.isUserLoggedIn) {
        return false
      }
      if (this.post.likes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    },
    downvoted: function () {
      if (!this.isUserLoggedIn) {
        return false
      }
      if (this.post.dislikes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    async upvote () {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.upvoted) {
          // console.log (this.post.likes)
          // this.upvoted = false
          this.post.likes = this.post.likes.filter(upvoter => upvoter !== this.user._id) // azonnali eredmény
          await PostService.unUpvote(this.post._id)
        } else {
          if (this.downvoted) {
            await this.downvote()
          }
          this.post.likes.push(this.user._id)
          await PostService.upvote(this.post._id)
        }
      } catch (err) {
        console.log(err)
      }
    },
    async downvote () {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.downvoted) {
          this.post.dislikes = this.post.dislikes.filter(downvoter => downvoter !== this.user._id) // azonnali eredmény
          await PostService.unDownvote(this.post._id)
        } else {
          if (this.upvoted) {
            await this.upvote()
          }
          this.post.dislikes.push(this.user._id)
          await PostService.downvote(this.post._id)
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>

</style>
