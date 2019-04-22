<template>
  <v-container xs12 class="pb-5" :id="post.title">
    <v-card>
      <v-layout row justify-center>
        <v-flex xs12>
          <div class="display-1 blue--text font-weight-bold py-1">{{ post.title }}</div>
        </v-flex>
        <v-btn
          absolute
          right
          flat
          fab
          small
          class="mt-1 mr-0 pr-0">
          <v-icon class="grey--text">fas fa-ellipsis-h</v-icon>
        </v-btn>
      </v-layout>
      <div>
        <div class="subheading light-blue--text pb-1">{{ post.createdBy.username }}</div>
      </div>
      <v-divider/>
      <v-img
        :src="post.url"
        width="100%"
        id="postImage"
        @click="goToPostPage"/>
      <v-divider/>
      <v-card-actions class="px-0 py-0">
        <v-container pa-0 ma-0>
          <v-layout v-if="reacted" justify-space-around class="py-1 px-0">
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="amber"
                  @click="react(0)">
                  <v-icon :class="[ reacted[0] ? 'amber--text amber--darken-4' : 'amber--text text--lighten-3' ]">sentiment_very_satisfied</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="light-green"
                  @click="react(1)">
                  <v-icon :class="[ reacted[1] ? 'light-green--text text--darken-2' : 'light-green--text text--lighten-3' ]">public</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="brown"
                  @click="react(2)">
                  <v-icon :class="[ reacted[2] ? 'brown--text text--darken-1' : 'brown--text text--lighten-3' ]">school</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="pink"
                  @click="react(3)">
                  <v-icon :class="[ reacted[3] ? 'pink--text text--darken-1' : 'pink--text text--lighten-3' ]">fas fa-cat</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="red"
                  @click="react(4)">
                  <v-icon :class="[ reacted[4] ? 'red--text text--darken-2' : 'red--text text--lighten-3' ]">whatshot</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="deep-purple"
                  @click="react(5)">
                  <v-icon :class="[ reacted[5] ? 'deep-purple--text text--darken-2' : 'deep-purple--text text--lighten-3' ]">palette</v-icon></v-btn>
              </v-flex>
              <v-flex>
                <v-btn
                  flat
                  fab
                  color="blue"
                  @click="react(6)">
                  <v-icon :class="[ reacted[6] ? 'blue--text text--darken-1' : 'blue--text text--lighten-3' ]">live_tv</v-icon></v-btn>
              </v-flex>
          </v-layout>
          <v-divider class="pa-0 ma-0"/>
          <v-layout justify-space-around class="py-1 px-0">
              <v-flex>
                <v-btn
                  flat
                  fab
                  small
                  @click="showComments">
                  <v-icon class="grey--text">comment</v-icon>
                </v-btn>
              </v-flex>
              <v-divider vertical class="my-2"/>
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
                  small
                  fab>
                  <v-icon class="grey--text">share</v-icon>
                </v-btn>
              </v-flex>
          </v-layout>
        </v-container>
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
    reacted: function () {
      let reactionsOfUser = [false, false, false, false, false, false, false]
      if (!this.isUserLoggedIn) {
        return reactionsOfUser
      } else if (this.post && this.post.reactions) {
        this.post.reactions.forEach((reaction) => {
          if (reaction.user === this.user._id) {
            reactionsOfUser[reaction.type] = true
          }
        })
        return reactionsOfUser
      }
    },
    score: function () {
      if (this.post && this.post.reactions) {
        return this.post.reactions.length
      } else {
        return 0
      }
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
    async react (type) {
      try {
        if (this.reacted[type]) {
          await PostService.unReact({
            postId: this.post._id,
            type: type
          })
          this.post.reactions = this.post.reactions.filter((reaction) => {
            return (reaction.user !== this.user._id || reaction.type !== type)
          })
          console.log('maradék reaccok: ')
          console.log(this.post.reactions)
        } else {
          await PostService.react({
            postId: this.post._id,
            type: type
          })
          this.post.reactions.push({
            user: this.user._id,
            type: type
          })
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
    },
    goToPostPage () {
      // document.getElementsByTagName('html')[0].style.overflow = 'hidden'
      if (this.$route.params.postId !== this.post._id) {
        this.$router.push({ name: 'postPage', params: { postId: this.post._id } })
        this.$emit('filter-post', this.post)
      }
    }
  },
  components: {
    CommentContainer
  }
}
</script>

<style>
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
