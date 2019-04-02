<template>
  <v-container>
    <h1 v-if="isNewPostAvailable" class="bold blue--text">See new posts</h1>
    <div v-for="post in posts" :key="post.id">
      <post :post="post" />
    </div>
  </v-container>
</template>

<script>
import Post from './AppPost'
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
