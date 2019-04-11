<template>
  <v-container xs12 class="pb-5" :id="post.title">
    <v-card>
      <div>
        <div class="display-1 blue--text font-weight-bold py-1">{{ post.title }}</div>
        <div class="subheading light-blue--text pb-1">{{ post.createdBy.username }}</div>
      </div>
      <v-divider/>
      <v-img
        :src="post.url"
        width="100%"
        id="postImage"
        @click="$router.push({ name: 'postPage', params: { postId: post._id } })"/>
      <v-divider/>
      <v-card-actions class="px-3 py-0">
        <v-layout justify-space-around class="py-1 px-0">
            <v-flex class="scoreFlex" align-self-center md2>
              <transition :name="scoreDirection" mode="out-in">
                <div
                  class="title"
                  :key="score">
                  {{ score }}
                </div>
              </transition>
            </v-flex>
            <v-divider vertical class="my-2"/>
            <v-flex>
              <v-btn
                flat
                fab
                @click="upvote()">
                <v-icon :class="[ upvoted ? 'light-blue--text' : 'grey--text' ]">arrow_upward</v-icon></v-btn>
            </v-flex>
            <v-flex>
              <v-btn
                flat
                fab
                @click="downvote()">
                <v-icon :class="[ downvoted ? 'light-blue--text' : 'grey--text' ]">arrow_downward</v-icon></v-btn>
            </v-flex>
            <v-flex>
              <v-btn
                flat
                fab
                @click="showComments">
                <v-icon class="grey--text">comment</v-icon>
              </v-btn>
            </v-flex>
            <v-flex>
              <v-btn
                flat
                fab>
                <v-icon class="grey--text">share</v-icon>
              </v-btn>
            </v-flex>
        </v-layout>
      </v-card-actions>
      <transition name="commentSlide">
        <CommentContainer :postId="post._id" v-if="showingComments"/>
      </transition>
    </v-card>
  </v-container>
</template>

<script>
import {mapState} from 'vuex'
import PostService from '@/services/PostService'
import CommentContainer from './CommentContainer'
// import goTo from 'vuetify/lib/components/Vuetify/goTo'
export default {
  props: [
    'post'
  ],
  data () {
    return {
      showingComments: false,
      scoreDirection: null
    }
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user',
      'closeComments'
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
    },
    score: function () {
      return this.post.likes.length - this.post.dislikes.length
    }
  },
  watch: {
    score (newVal, oldVal) {
      if (newVal > oldVal) {
        this.scoreDirection = 'scoreUp'
      } else {
        this.scoreDirection = 'scoreDown'
      }
    } /* ,
    closeComments () {
      this.showingComments = false
    } */
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
    },
    async showComments () {
      this.$store.dispatch('removeReplyListener')
      if (!this.showingComments) {
        // await this.$store.dispatch('closeComments')
      }
      this.showingComments = !this.showingComments
      /* if (this.showingComments) {
        this.$vuetify.goTo(window.scrollY, { offset: -700, easing: 'easeOutCubic' })
        console.log(window.scrollY)
      } */
    }
  },
  components: {
    CommentContainer
  }
}
</script>

<style scoped>
.commentSlide-enter-active {
   transition-duration: 0.5s;
   transition-timing-function: ease-in;
}

.commentSlide-leave-active {
   transition-duration: 0.5s;
   transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}

.commentSlide-enter-to, .commentSlide-leave {
   max-height: 800px;
   overflow: hidden;
}

.commentSlide-enter, .commentSlide-leave-to {
   overflow: hidden;
   max-height: 0;
}

.scoreUp-enter-active {
  transition: all .3s ease;
}
.scoreUp-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scoreUp-enter
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}

.scoreUp-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.scoreDown-enter-active {
  transition: all .2s ease;
}
.scoreDown-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scoreDown-enter
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateY(-10px);
  opacity: 0;
}

.scoreDown-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.scoreFlex {
  overflow: visible;
}

#postImage {
  cursor: pointer;
}

</style>
