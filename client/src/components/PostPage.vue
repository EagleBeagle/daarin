<template>
  <v-container xs12>
    <v-layout xs12 justify-center>
      <!-- <transition name="fade"> -->
        <v-flex xs4 v-if="post" class="post">
          <AppPost :post="post"/>
        </v-flex>
      <!-- </transition> -->
    </v-layout>
  </v-container>
</template>

<script>
import PostService from '@/services/PostService'
import AppPost from './AppPost'
export default {
  data () {
    return {
      post: null
    }
  },
  async mounted () {
    await this.getPost()
  },
  methods: {
    async getPost () {
      let response = await PostService.getPost(this.$route.params.postId)
      console.log(response.data[0])
      this.post = response.data[0]
    }
  },
  components: {
    AppPost
  }
}
</script>

<style scoped>
.post {
  animation-duration: 500ms;
}
</style>
