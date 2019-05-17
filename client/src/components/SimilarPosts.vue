<template>
  <v-container pt-5 mt-5 v-if="posts && posts[0]">
      <span class="headline font-weight-bold grey--text">Similar Posts</span>
      <v-divider class="mt-1"/>
        <v-layout pt-3 row wrap>
          <v-flex v-if="loading">
            <v-progress-circular
              class="pb-4 pt-5"
              indeterminate
              color="light-blue accent-2">
            </v-progress-circular>
          </v-flex>
          <v-flex v-if="!loading" xs4 v-for="post in posts" :key="post._id" align-self-center>
            <AppPost class="post" :post="post" :small="true"/>
          </v-flex>
        </v-layout>
  </v-container>
</template>

<script>
import AppPost from './AppPost'
import PostService from '@/services/PostService'
export default {
  data () {
    return {
      posts: [],
      loading: false
    }
  },
  props: [
    'postId'
  ],
  async mounted () {
    await this.getSimilarPosts()
  },
  watch: {
    postId () {
      this.getSimilarPosts()
    }
  },
  methods: {
    async getSimilarPosts () {
      this.loading = true
      try {
        let posts = (await PostService.getSimilarPosts(this.postId)).data
        this.posts = posts
        console.log(posts)
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'Failed to fetch similar posts.')
      }
      this.loading = false
    }
  },
  components: {
    AppPost
  }
}
</script>

<style scoped>
.post {
  transform: scale(0.95);
}
</style>
