<template>
  <v-container pa-0 ma-0>
    <!-- <h1 v-if="isNewPostAvailable" class="bold blue--text">See new posts</h1> -->
    <transition-group :name="transition" tag="div">
    <!-- <transition-group v-if="filtered" name="slideUp" tag="div"> -->
      <div v-for="post in posts" :key="post._id">
        <div>
          <post class="post" :id="'post-' + post._id" :post="post" @filter-post="filterPost"/>
        </div>
      </div>
    <!-- </transition-group> -->
    </transition-group>
  </v-container>
</template>

<script>
import Post from './AppPost'
export default {
  data () {
    return {
      filtered: false,
      transition: 'zoom'
    }
  },
  props: [
    'posts',
    'isNewPostAvailable'
  ],
  beforeDestroy () {
    window.onscroll = () => {}
  },
  async mounted () {
    // document.getElementsByTagName('html')[0].style.overflow = 'auto'
    // document.getElementsByTagName('body')[0].scrollTo(0, 0)
    setTimeout(() => {
      this.scroll()
    }, 600)
  },
  methods: {
    filterPost (post) {
      this.filtered = true
      this.transition = 'fade'
      console.log(post)
      this.$emit('filter-post', post)
      setTimeout(() => {
        this.filtered = false
        this.transition = 'zoom'
      }, 1000)
    },
    scroll () {
      window.onscroll = async () => {
        let bottomOfWindow = document.documentElement.scrollTop + window.innerHeight === document.documentElement.offsetHeight
        if (bottomOfWindow) {
          this.scrollGuard()
        }
      }
    },
    scrollGuard () {
      if (!this.filtered && this.posts && !(this.posts.length < 2)) {
        this.$emit('reachedBottom')
      }
    }
  },
  components: {
    Post
  }
}
</script>

<style scoped>
div {
  animation-duration: 500ms;
}
.filtered {
  animation-duration: 500ms;
}
.unfiltered {
  animation-duration: 500ms;
}
.zoom-leave-active {
  position: fixed;
  animation-duration: 500ms;
}
.fade {
  animation-duration: 200ms;
}
.fade-leave-active {
  position: fixed;
}
.fade-move {
  transition: all 1s;
}
</style>
