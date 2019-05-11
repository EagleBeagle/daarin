<template>
  <v-container align-center pt-2 pb-0 px-0>
    <v-layout justify-center>
      <v-flex xs1 align-self-center mr-3>
        <v-avatar>
          <v-img v-if="comment.createdBy.avatar" id="avatar" :src="comment.createdBy.avatar"></v-img>
          <v-icon id="avatar-icon" large v-else>fas fa-user-circle</v-icon>
        </v-avatar>
      </v-flex>
      <v-flex xs9 align-self-start text-xs-left px-0>
        <v-layout row>
          <v-flex xs9>
            <span class="title pl-3 pb-1">{{ comment.createdBy.username }}</span>
            <span class="grey--text">•</span>
            <span class="grey--text">{{ comment.sinceCreated }}</span>
          </v-flex>
          <v-flex xs7>
            <v-menu
                v-if="user"
                absolute
                transition="scale-transition"
                :class="comment.replyTo ? 'pl-0' : 'pl-2'">
                <v-btn
                  absolute
                  slot="activator"
                  flat
                  :ripple="false"
                  fab
                  small
                  class="pl-5 ml-5 optionsButton">
                  <v-icon class="grey--text">fas fa-ellipsis-h</v-icon>
                </v-btn>
                <v-list class="postMenuList">
                  <v-list-tile
                    @click="reportComment">
                    <v-list-tile-title>
                      Report
                    </v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile
                    @click="deleteComment"
                    v-if="user && user._id === comment.createdBy._id">
                    <v-list-tile-title>
                      Delete
                    </v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
            </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs11>
            <div
              id="commentBody"
              class="body-1 light-blue accent-3 white--text pa-2 pl-3 ma-0">
              <span v-if="comment.replyUsername" class="body-1 font-weight-bold">{{ comment.replyUsername[0] }}</span>
              {{ comment.text }}
            </div>
          </v-flex>
          <v-flex xs1 align-self-center>
            <transition :name="scoreDirection" mode="out-in">
              <span
                :key="score"
                class="title pl-4 ml-0">
                {{ score }}
              </span>
            </transition>
          </v-flex>
          <v-layout>
            <v-flex xs9>
              <v-btn
                class="ma-0 ml-2"
                style="width: 20px; height: 20px;"
                small
                flat
                fab
                @click="upvote()">
                <v-icon :class="[ upvoted ? 'light-blue--text' : 'grey--text' ]" small>arrow_upward</v-icon>
              </v-btn>
              <v-btn
                class="ma-0"
                small
                flat
                fab
                @click="downvote()">
                <v-icon :class="[ downvoted ? 'light-blue--text' : 'grey--text' ]" small>arrow_downward</v-icon>
              </v-btn>
            </v-flex>
            <v-flex align-self-center xs4>
              <span
              v-if="locallyReplied || (!comment.replyTo && comment.replyCount !== 0)"
              class="grey--text"
              style="cursor: pointer"
              @click="showingReplies = !showingReplies">
                <span v-if="!showingReplies">
                  <span v-if="comment.replyCount > 1">
                  see {{ comment.replyCount }} replies
                  </span>
                  <span v-if="comment.replyCount === 1">
                    see {{ comment.replyCount }} reply
                  </span>
                </span>
                <span v-else>
                  hide replies
                </span>
              </span>
            </v-flex>
            <v-flex xs3>
              <v-btn
                class="ma-0"
                small
                fab
                flat
                @click="replying = !replying">
                <v-icon class="grey--text" small>reply</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-flex>
    </v-layout>
    <transition name="commentSlide">
      <v-container v-if="replying" pa-0 ma-0>
        <v-layout px-3 pt-3 pb-4 pl-5 ml-4 justify-center row wrap>
          <v-flex xs1 align-self-center mr-3>
          <v-avatar
            size="30">
            <v-img v-if="user.avatar" id="avatar" :src="user.avatar"></v-img>
            <v-icon id="avatar-icon-small" large v-else>fas fa-user-circle</v-icon>
          </v-avatar>
        </v-flex>
          <v-flex pa-0 pb-1 pt-0 ma-0 mb-0 xs8>
            <v-textarea
              color="light-blue--accent-2"
              class="pa-0 ma-0"
              auto-grow
              flat
              rows="1"
              :placeholder="'reply to ' + comment.createdBy.username + '...'"
              hide-details
              v-model="replyText"
              >
            </v-textarea>
          </v-flex>
          <v-flex xs1 align-self-center>
            <v-icon
              small
              :color="replyText ? 'light-blue' : 'grey'"
              style="cursor: pointer"
              v-on="replyText ? { click: createReply } : {}">
              send
            </v-icon>
          </v-flex>
        </v-layout>
      </v-container>
    </transition>
    <transition name="commentSlide">
      <div v-if="showingReplies">
        <ReplyContainer :postId="comment.to" :replyTo="comment"/>
      </div>
    </transition>
  </v-container>

</template>

<script>
import {mapState} from 'vuex'
import CommentService from '@/services/CommentService'
import ReplyContainer from './ReplyContainer'
export default {
  name: 'comment',
  props: [
    'comment'
  ],
  data () {
    return {
      replying: false,
      replyText: null,
      showingReplies: false,
      scoreDirection: null,
      locallyReplied: false // kell ez nekünk?
    }
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user'
    ]),
    upvoted: function () {
      if (!this.isUserLoggedIn) {
        return false
      }
      if (this.comment.likes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    },
    downvoted: function () {
      if (!this.isUserLoggedIn) {
        return false
      }
      if (this.comment.dislikes.includes(this.user._id)) {
        return true
      } else {
        return false
      }
    },
    score: function () {
      return this.comment.likes.length - this.comment.dislikes.length
    }
  },
  watch: {
    score (newVal, oldVal) {
      if (newVal > oldVal) {
        this.scoreDirection = 'scoreUp'
      } else {
        this.scoreDirection = 'scoreDown'
      }
    },
    'comment.replyCount' (val) {
      if (val === 0) {
        this.showingReplies = false
      }
    }
  },
  mounted () {
  },
  methods: {
    async createReply () {
      try {
        let replyTo
        let text = this.replyText // hogy ne változzon a textfieldben
        if (this.comment.replyTo) {
          replyTo = this.comment.replyTo
          text = `@${this.comment.createdBy.username} ${this.replyText}`
        } else {
          replyTo = this.comment._id
        }
        let response = await CommentService.createComment(this.comment.to, {
          text: text,
          replyTo: replyTo
        })
        this.replyText = ''
        this.replying = !this.replying
        if (!this.comment.replyTo) {
          this.comment.replyCount += 1
          this.locallyReplied = true
        }
        let reply = response.data.comment
        console.log(reply)
        this.showingReplies = true
        this.$store.dispatch('setLocalReply', reply)
      } catch (error) {
        this.$store.dispatch('setSnackbarText', 'An error has occured while creating your comment.')
      }
    },
    async upvote () {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.upvoted) {
          // console.log (this.post.likes)
          // this.upvoted = false
          this.comment.likes = this.comment.likes.filter(upvoter => upvoter !== this.user._id) // azonnali eredmény
          await CommentService.unUpvote(this.comment.to, this.comment._id)
        } else {
          if (this.downvoted) {
            await this.downvote()
          }
          this.comment.likes.push(this.user._id)
          await CommentService.upvote(this.comment.to, this.comment._id)
        }
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error has occured during the upvote.')
      }
    },
    async downvote () {
      if (!this.isUserLoggedIn) {
        return
      }
      try {
        if (this.downvoted) {
          this.comment.dislikes = this.comment.dislikes.filter(downvoter => downvoter !== this.user._id) // azonnali eredmény
          await CommentService.unDownvote(this.comment.to, this.comment._id)
        } else {
          if (this.upvoted) {
            await this.upvote()
          }
          this.comment.dislikes.push(this.user._id)
          await CommentService.downvote(this.comment.to, this.comment._id)
        }
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error has occured during the downvote.')
      }
    },
    async reportComment () {
      try {
        await CommentService.report(this.comment._id)
        this.$store.dispatch('setSnackbarText', 'Comment reported succesfully.')
      } catch (err) {
        this.$store.dispatch('setSnackbarText', err.response.data.error)
      }
    },
    async deleteComment () {
      try {
        await CommentService.delete(this.comment._id)
        this.$store.dispatch('setSnackbarText', 'Comment deleted successfully.')
        if (!this.comment.replyTo) {
          this.$store.dispatch('setDeletedComment', this.comment._id)
        } else {
          this.$store.dispatch('setDeletedReply', this.comment._id)
        }
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error occured during deletion.')
      }
    }
  },
  components: {
    ReplyContainer
  }
}
</script>

<style scoped>
#avatar {
  border-radius: 20px;
}

#avatar-icon {
  font-size: 50px;
}

#avatar-icon-smal {
  font-size: 30px;
}

#commentBody {
  border-radius: 30px;
  word-wrap: break-word;
}

.v-btn--floating.v-btn--small {
    height: 20px;
    width: 20px;
}

.commentSlide-enter-active {
   transition-duration: 0.3s;
   transition-timing-function: ease-in;
}

.commentSlide-leave-active {
   transition-duration: 0.3s;
   transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}

.commentSlide-enter-to, .commentSlide-leave {
   max-height: 400px;
   overflow: hidden;
}

.commentSlide-enter, .commentSlide-leave-to {
   overflow: hidden;
   max-height: 0;
   opacity: 0;
}

.scoreUp-enter-active {
  transition: all .3s ease;
}
.scoreUp-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scoreUp-enter
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateY(5px);
  opacity: 0;
}

.scoreUp-leave-to {
  transform: translateY(-5px);
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
  transform: translateY(-5px);
  opacity: 0;
}

.scoreDown-leave-to {
  transform: translateY(5px);
  opacity: 0;
}

.scoreFlex {
  overflow: visible;
}

.optionsButton, .postMenu, .postMenuList {
  z-index: 0;
}

.optionsButton--active:before, .optionsButton:focus:before, .optionsButton:hover:before {
    background-color: transparent;
}
</style>
