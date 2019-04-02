<template>
  <v-container xs12>
    <v-layout xs12 justify-center>
      <v-flex xs6 v-if="post">
        <AppPost :post="post"/>
      </v-flex>
      <v-spacer/>
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

</style>
