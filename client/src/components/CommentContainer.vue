<template>
  <div v-view="viewHandler">
    <v-container v-if="(comments && comments.length) || commentsAvailable" class="pa-0 ma-0">
      <v-divider/>
      <v-layout my-2 py-1>
        <v-flex xs6>
          <div
            style="cursor: pointer"
            @click="relevantShowed = false"
            :class="relevantShowed ? 'title grey--text' : 'title blue--text'">
            Newest
          </div>
        </v-flex>
        <v-divider vertical/>
        <v-flex xs6>
          <div
            style="cursor: pointer"
            @click="relevantShowed = true"
            :class="relevantShowed ? 'title blue--text' : 'title grey--text'">
            Relevant
          </div>
        </v-flex>
      </v-layout>
      <v-divider class="pb-0"/>
        <v-container v-if="visible" pa-0 ma-0 class="commentContainer" :id="postId + '-comments'">
          <v-progress-circular
            v-if="loadingTop && !loadingWhenVisible"
            class="pb-4 pt-5"
            indeterminate
            color="light-blue accent-2">
          </v-progress-circular>
          <v-layout v-if="loadingWhenVisible" column justify-center align-center commentContainer>
            <v-progress-circular
              class="pb-4 pt-5"
              indeterminate
              color="light-blue accent-2">
            </v-progress-circular>
          </v-layout>
          <div v-if="comments != 'empty'" v-for="comment in comments" :key="comment.id">
            <PostComment :comment="comment" />
          </div>
          <v-progress-circular
            class="pb-3 pt-5"
            indeterminate
            color="light-blue accent-2"
            v-if="loadingBottom && !loadingWhenVisible">
          </v-progress-circular>
        </v-container>
        <v-container v-else :style="commentContainerHeight" pa-0 ma-0>
        </v-container>
      <v-divider class="pa-0 ma-0"/>
      <v-layout v-if="isUserLoggedIn" xs12 pa-0 ma-0 pr-3 row wrap>
        <v-flex pa-0 pb-1 ma-0 mb-1 xs11>
          <v-textarea
            solo
            class="pa-0 ma-0"
            auto-grow
            rows="1"
            flat
            placeholder="Add a comment..."
            hide-details
            v-model="commentText"
            >
          </v-textarea>
        </v-flex>
        <v-flex xs1 align-self-center>
          <div
            :class="[ commentText ? 'title blue--text' : 'title grey--text' ]"
            v-on="commentText ? { click: createComment } : {}"
            style="cursor: pointer">Post</div>
        </v-flex>
      </v-layout>
    </v-container>
    <v-container v-else class="pa-0 ma-0">
      <v-divider/>
      <v-layout column justify-center emptyCommentContainer>
        <div>
          <v-progress-circular
          class="py-5"
          indeterminate
          color="light-blue accent-2"
          v-if="loadingInitial">
        </v-progress-circular>
        </div>
        <div class="body-1 py-4 grey--text" v-if="!loadingInitial">NO COMMENTS YET</div>
      </v-layout>
      <v-divider class="pa-0 ma-0"/>
      <v-layout v-if="isUserLoggedIn" xs12 pa-0 ma-0 pr-3 row wrap>
        <v-flex pa-0 pb-1 ma-0 mb-1 xs11>
          <v-textarea
            solo
            class="pa-0 ma-0"
            auto-grow
            rows="1"
            flat
            placeholder="Add a comment..."
            hide-details
            v-model="commentText"
            >
          </v-textarea>
        </v-flex>
        <v-flex xs1 align-self-center>
          <div
            :class="[ commentText ? 'title blue--text' : 'title grey--text' ]"
            v-on="commentText ? { click: createComment } : {}"
            style="cursor: pointer">Post</div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import PostComment from './PostComment'
import CommentService from '@/services/CommentService'
import {mapState} from 'vuex'
export default {
  props: [
    'postId'
  ],
  data () {
    return {
      commentText: null,
      comments: null,
      commentsAvailable: false,
      firstTimeEntered: true,
      firstTimeLeft: true,
      commentStreamCb: null,
      commentStreamEvent: null,
      firstLoadedComment: null,
      lastLoadedComment: null,
      loadingInitial: true,
      loadingTop: false,
      loadingBottom: false,
      loadingWhenVisible: false,
      lastFetchTime: null,
      lastScrollPosition: null,
      currentScrollPosition: null,
      locallyAddedComments: [],
      visible: true,
      commentContainerHeight: null,
      relevantShowed: true
    }
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user',
      'eventSource',
      'closeComments'
    ])
  },
  watch: {
    closeComments () {
      if (this.commentStreamCb) {
        this.eventSource.removeEventListener(this.commentStreamEvent, this.commentStreamCb)
      }
    },
    async relevantShowed () {
      this.comments = []
      await this.getComments()
    }
  },
  beforeDestroy () {
    if (this.commentStreamCb) {
      this.eventSource.removeEventListener(this.commentStreamEvent, this.commentStreamCb)
    }
    this.$store.dispatch('removeReplyListener')
  },
  async mounted () {
    await this.getComments()
    await this.addSSEListeners()
    await this.scroll()
  },
  methods: {
    async addSSEListeners () {
      if (this.user) {
        await this.$store.dispatch('closeComments') // ??
        this.commentStreamCb = (event) => {
          let streamedComments = JSON.parse(event.data)
          streamedComments.forEach((comment) => {
            comment.sinceCreated = this.timeDifference(comment.createdAt)
          })
          this.comments.forEach((comment) => {
            let streamedComment = streamedComments.find(streamedComment => streamedComment._id === comment._id)
            if (streamedComment) {
              comment.likes = streamedComment.likes
              comment.dislikes = streamedComment.dislikes
              comment.sinceCreated = this.timeDifference(streamedComment.createdAt)
              comment.replyCount = streamedComment.replyCount
            }
          })
          console.log(streamedComments)
        }
        this.commentStreamEvent = 'comment'
        this.eventSource.addEventListener(this.commentStreamEvent, this.commentStreamCb)
      }
    },
    async createComment () { // TODO: error handling
      let commentContainer = document.getElementById(this.postId + '-comments')
      try {
        let response = await CommentService.createComment(this.postId, {
          text: this.commentText
        })
        let comment = response.data.comment
        comment.createdBy = {
          username: this.user.username
        }
        comment.sinceCreated = this.timeDifference(comment.createdAt)
        this.comments = [comment, ...this.comments]
        this.locallyAddedComments.push(comment._id)
        console.log(comment.createdAt)
        this.commentText = ''
        if (this.comments.length > 5) commentContainer.scrollTo(0, 0)
        // await this.getComments() SSE-vel nem kell
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async getComments () {
      try {
        this.loadingInitial = true
        this.loadingWhenVisible = true
        let response
        let sortCriteria = this.relevantShowed ? 'relevancy' : 'date'
        response = await CommentService.getCommentsOfPost({
          postId: this.postId,
          sortBy: sortCriteria
        })
        this.comments = response.data
        this.comments.forEach((comment) => {
          comment.sinceCreated = this.timeDifference(comment.createdAt)
        })
        if (this.comments.length) {
          this.firstLoadedComment = this.comments[0]
          this.lastLoadedComment = this.comments[this.comments.length - 1]
          console.log('LEGUJABB: ' + this.firstLoadedComment.createdAt)
          console.log('LEGREGEBBI: ' + this.lastLoadedComment.createdAt)
        }
        this.loadingInitial = false
        this.loadingWhenVisible = false
        if (this.comments.length > 0) {
          this.commentsAvailable = true
        }
      } catch (error) {
        console.log('BAJ VAN:' + error)
        this.loadingInitial = false
        this.loadingWhenVisible = false
      }
    },
    async getHigherComments () {
      try {
        let response
        if (this.relevantShowed) {
          response = await CommentService.getCommentsOfPost({
            postId: this.postId,
            highest: this.firstLoadedComment
          })
        } else {
          response = await CommentService.getCommentsOfPost({
            postId: this.postId,
            newest: this.firstLoadedComment
          })
        }
        let newComments = response.data
        if (newComments[0]) {
          this.firstLoadedComment = newComments[0]
        }
        newComments.forEach((comment, index) => {
          this.locallyAddedComments.forEach((localCommentId) => {
            if (localCommentId === comment._id) {
              newComments.splice(index, 1)
            }
          })
          comment.sinceCreated = this.timeDifference(comment.createdAt)
        })
        this.comments = [...newComments, ...this.comments]
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async getLowerComments () {
      try {
        let response
        if (this.relevantShowed) {
          response = await CommentService.getCommentsOfPost({
            postId: this.postId,
            lowest: this.lastLoadedComment
          })
        } else {
          response = await CommentService.getCommentsOfPost({
            postId: this.postId,
            oldest: this.lastLoadedComment
          })
        }
        let newComments = response.data
        // console.log('RÉGEBBI CUCLIK: ' + response)
        if (newComments.length) {
          this.lastLoadedComment = newComments[newComments.length - 1]
        }
        newComments.forEach((comment, index) => { // exp
          this.locallyAddedComments.forEach((localCommentId) => {
            if (localCommentId === comment._id) {
              newComments.splice(index, 1)
            }
          })
          comment.sinceCreated = this.timeDifference(comment.createdAt)
        })
        this.comments = [...this.comments, ...newComments]
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async viewHandler (e) {
      if (e.type === 'enter') {
        this.visible = true
        if (this.firstTimeEntered) {
          this.firstTimeEntered = !this.firstTimeEntered
        } else {
          this.loadingWhenVisible = true
          await this.getComments()
          await this.addSSEListeners()
          this.loadingWhenVisible = false
        }
      } else if (e.type === 'exit') {
        if (this.firstTimeLeft) {
          this.firstTimeLeft = !this.firstTimeLeft
        } else {
          if (this.commentStreamCb) {
            this.eventSource.removeEventListener(this.commentStreamEvent, this.commentStreamCb)
          }
          this.$store.dispatch('removeReplyListener')
          let commentContainer = document.getElementById(this.postId + '-comments')
          if (commentContainer) {
            this.commentContainerHeight = `height: ${commentContainer.clientHeight}px`
          }
          this.visible = false
          this.comments = 'empty'
        }
      }
      // console.log(e.type) // 'enter', 'exit', 'progress'
      /* console.log(e.percentInView) // 0..1 how much element overlap the viewport
      console.log(e.percentTop) // 0..1 position of element at viewport 0 - above , 1 - below
      console.log(e.percentCenter) // 0..1 position the center of element at viewport 0 - center at viewport top, 1 - center at viewport bottom
      console.log(e.scrollPercent) // 0..1 current scroll position of page
      console.log(e.scrollValue) // 0..1 last scroll value (change of page scroll offset)
      console.log(e.target.rect) // element.getBoundingClientRect() result
      */
    },
    async scroll () {
      let commentContainer = document.getElementById(this.postId + '-comments')
      if (commentContainer) {
        let gotUpAfterUpdate = true
        let gotDownAfterUpdate = true
        commentContainer.onscroll = async () => {
          let topOfWindow = commentContainer.scrollTop + commentContainer.clientHeight === commentContainer.offsetHeight
          let bottomOfWindow = commentContainer.scrollHeight - commentContainer.scrollTop === commentContainer.clientHeight
          this.currentScrollPosition = commentContainer.scrollTop
          if (topOfWindow && !gotUpAfterUpdate) {
            setTimeout(function () {
              gotUpAfterUpdate = true
            }, 1000)
          }
          if (bottomOfWindow && !gotDownAfterUpdate) {
            setTimeout(function () {
              gotDownAfterUpdate = true
            }, 1000)
          }
          if (topOfWindow && !this.loadingTop && gotUpAfterUpdate) {
            let commentsLength = this.comments.length
            this.loadingTop = true
            await this.getHigherComments()
            this.loadingTop = false
            let newCommentsLength = this.comments.length - commentsLength
            commentContainer.scrollTo(0, newCommentsLength * 89 + this.currentScrollPosition)
            gotUpAfterUpdate = false
          /* else if (bottomOfWindow && !this.loadingBottom && (!(this.currentScrollPosition < this.lastScrollPosition + 70 && this.currentScrollPosition > this.lastScrollPosition - 70) || !this.lastScrollPosition)) {
            this.loadingBottom = true
            await this.getLowerComments()
            this.loadingBottom = false
            this.lastScrollPosition = this.currentScrollPosition */
          } else if (bottomOfWindow && !this.loadingBottom && gotDownAfterUpdate) {
            this.loadingBottom = true
            await this.getLowerComments()
            this.loadingBottom = false
            gotDownAfterUpdate = false
          }
          /* if (this.currentScrollPosition + 70 < this.lastScrollPosition) {
            this.lastScrollPosition = this.currentScrollPosition
          } */
        }
      }
    },
    timeDifference (createdAt) {
      let msPerMinute = 60 * 1000
      let msPerHour = msPerMinute * 60
      let msPerDay = msPerHour * 24
      let msPerMonth = msPerDay * 30
      let msPerYear = msPerDay * 365
      let elapsed = Date.now() - (new Date(createdAt).getTime())
      if (elapsed < msPerMinute) {
        // let time = Math.round(elapsed / 1000)
        return 'just now'
      } else if (elapsed < msPerHour) {
        let time = Math.round(elapsed / msPerMinute)
        if (time === 1) return time + ' minute ago'
        else return time + ' minutes ago'
      } else if (elapsed < msPerDay) {
        let time = Math.round(elapsed / msPerHour)
        if (time === 1) return time + ' hour ago'
        else return time + ' hours ago'
      } else if (elapsed < msPerMonth) {
        let time = Math.round(elapsed / msPerDay)
        if (time === 1) return time + ' day ago'
        else return time + ' days ago'
      } else if (elapsed < msPerYear) {
        let time = Math.round(elapsed / msPerMonth)
        if (time === 1) return time + ' month ago'
        else return time + ' months ago'
      } else {
        let time = Math.round(elapsed / msPerYear)
        if (time === 1) return time + ' year ago'
        else return time + ' years ago'
      }
    }
  },
  components: {
    PostComment
  }
}

</script>

<style scoped>
.commentContainer {
  overflow-y: auto;
  height: 500px;
}

.emptyCommentContainer {
  height: 545px;
}

.commentContainer::-webkit-scrollbar {display:none;}

</style>
