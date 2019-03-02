<template>
  <v-card>
    <div>
      <h1 class="bold blue--text">{{ post.title }}</h1>
      <p class="light-blue--text">{{ post.createdBy.username }}</p>
    </div>
    <v-divider/>
    <v-img :src="post.content" width="100%"/>
    <v-divider/>
    <v-card-title>
        <v-btn
          @click="upvote(post)">
          <v-icon class="light-blue--text">arrow_upward</v-icon></v-btn>
        <v-btn
          @click="downvote(post)">
          <v-icon class="light-blue--text">arrow_downward</v-icon></v-btn>
        <h3>{{ post.likes.length - post.dislikes.length }}</h3>
    </v-card-title>
  </v-card>
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
    async upvote (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.upvoted) {
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
        if (this.downvoted) {
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
      if (post.likes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    },
    isDownvoted (post) {
      if (!this.isUserLoggedIn) {
        return
      }
      if (post.dislikes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>

<style scoped>

</style>
