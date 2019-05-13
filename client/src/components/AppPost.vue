<template>
  <v-container xs12 class="pb-5" :id="post.title">
    <v-card>
      <v-layout row justify-center>
        <v-flex xs12>
          <div class="display-1 blue--text font-weight-bold py-1 postTitle">{{ post.title }}</div>
        </v-flex>
        <v-flex>
          <v-menu
            v-if="user && !small"
            absolute
            transition="scale-transition"
            class="postMenu">
            <v-btn
              absolute
              slot="activator"
              right
              flat
              :ripple="false"
              fab
              small
              class="mr-0 pr-0 pl-4 pb-3 pt-3 optionsButton"
              :id="'optionsButton-' + post._id">
              <v-icon class="grey--text">fas fa-ellipsis-h</v-icon>
            </v-btn>
            <v-list class="postMenuList">
              <v-list-tile
                @click="reportPost">
                <v-list-tile-title>
                  Report
                </v-list-tile-title>
              </v-list-tile>
              <v-list-tile
                @click="deletePost"
                v-if="user && user._id === post.createdBy._id">
                <v-list-tile-title>
                  Delete
                </v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>
        </v-flex>
      </v-layout>
      <div>
        <div
          class="subheading light-blue--text pb-1"
          style="cursor: pointer"
          @click="$router.push({ name: 'userPage', params: { userId: post.createdBy._id } })"
          >{{ post.createdBy.username }}</div>
      </div>
      <v-divider/>
      <v-img
        :src="post.url"
        width="100%"
        id="postImage"
        @click="goToPostPage"/>
      <v-divider/>
      <v-card-actions class="px-0 py-0" v-if="!small">
        <v-container pa-0 ma-0>
          <v-layout justify-center class="py-1 px-0" row wrap>
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
                <v-menu
                  absolute
                  transition="scale-transition"
                  class="postMenu">
                  <v-btn
                    slot="activator"
                    flat
                    fab
                    small>
                    <v-icon class="grey--text">share</v-icon>
                  </v-btn>
                      <v-card class="px-2 py-2">
                        <v-layout>
                        <v-flex class="pr-2" @click="copyToClipboard">
                          <v-icon class="shareIcon">fas fa-clipboard</v-icon>
                        </v-flex>
                        <v-divider vertical class="mr-1"/>
                        <v-flex>
                        <social-sharing :url="postLink"
                          :title="'Daarin post: ' + post.title"
                          inline-template>
                          <span style="cursor: default">
                            <network class="px-1" network="facebook">
                              <v-icon class="shareIcon" style="color: #3b5998">fab fa-facebook-square</v-icon>
                            </network>
                            <network class="px-1" network="twitter">
                              <v-icon class="shareIcon" style="color: #00aced">fab fa-twitter</v-icon>
                            </network>
                            <network class="px-1" network="pinterest">
                              <v-icon class="shareIcon" style="color: #bd081c">fab fa-pinterest</v-icon>
                            </network>
                            <network class="px-1" network="reddit">
                              <v-icon class="shareIcon" style="color: #ff4500">fab fa-reddit</v-icon>
                            </network>
                            <network class="px-1" network="email">
                                <v-icon class="shareIcon">fas fa-envelope</v-icon>
                            </network>
                            </span>
                      </social-sharing>
                      </v-flex>
                      </v-layout>
                    </v-card>
                </v-menu>
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
    'post',
    'small'
  ],
  data () {
    return {
      showingComments: false,
      scoreDirection: null,
      postLink: null
    }
  },
  mounted () {
    this.postLink = `http://www.${window.location.host}/post/${this.post._id}`
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user',
      'closeComments'
    ]),
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
        let users = new Set()
        this.post.reactions.forEach(reaction => {
          users.add(reaction.user)
        })
        return users.size
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
    async react (type) {
      if (!this.user) {
        this.$store.dispatch('setSnackbarText', 'Create an account to be able to react.')
      } else if (!this.user.confirmed) {
        this.$store.dispatch('setSnackbarText', 'Confirm your email to react.')
      } else {
        try {
          if (this.reacted[type]) {
            await PostService.unReact({
              postId: this.post._id,
              type: type
            })
            this.post.reactions = this.post.reactions.filter((reaction) => {
              return (reaction.user !== this.user._id || reaction.type !== type)
            })
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
      }
    },
    async reportPost () {
      if (!this.user.confirmed) {
        this.$store.dispatch('setSnackbarText', 'Confirm your email to access this feature.')
      } else {
        try {
          await PostService.report(this.post._id)
          this.$store.dispatch('setSnackbarText', 'Post reported succesfully.')
        } catch (err) {
          console.log(err)
          this.$store.dispatch('setSnackbarText', err.response.data.error)
        }
      }
    },
    async deletePost () {
      try {
        await PostService.delete(this.post._id)
        this.$store.dispatch('setSnackbarText', 'Post deleted succesfully.')
        this.$store.dispatch('setDeletedPost', this.post._id)
      } catch (err) {
        console.log(err)
        this.$store.dispatch('setSnackbarText', 'An error occured during deletion.')
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
    async copyToClipboard () {
      await this.$copyText(this.postLink)
      this.$store.dispatch('setSnackbarText', 'Link copied to clipboard.')
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

.optionsButton, .postMenu, .postMenuList {
  z-index: 0;
}

.optionsButton--active:before, .optionsButton:focus:before, .optionsButton:hover:before {
    background-color: transparent;
}

.shareIcon {
  cursor: pointer;
}

.postTitle {
  padding: 40px;
  word-break:break-all;
}
</style>
