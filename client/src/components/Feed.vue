<template>
  <v-layout justify-center>
    <v-flex xs4>
      <h1 v-if="isNewPostAvailable" class="bold blue--text">See new posts</h1>
      <div v-for="post in posts" :key="post.id">
        {{ post.id }}
        <v-flex class="pb-5">
          <post :post="post" />
        </v-flex>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import Post from './Post'
export default {
  props: [
    'posts',
    'isNewPostAvailable'
  ],
  beforeDestroy () {
    window.onscroll = () => {}
  },
  async mounted () {
    this.scroll()
  },
  methods: {
    scroll () {
      window.onscroll = async () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight
        if (bottomOfWindow) {
          this.$emit('reachedBottom')
        }
      }
    }
  },
  components: {
    Post
  }
}
</script>

<style scoped>
</style>
