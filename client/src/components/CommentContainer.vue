<template>
  <div v-view="viewHandler">
    <v-container v-if="comments && comments.length" class="pa-0 ma-0">
      <v-divider/>
      <v-layout my-2 py-1>
        <v-flex xs6>
          <div class="title blue--text">
            Newest
          </div>
        </v-flex>
        <v-divider vertical/>
        <v-flex xs6>
          <div class="title">
            Relevant
          </div>
        </v-flex>
      </v-layout>
      <v-divider class="pb-0"/>
      <div v-bar id="vb">
        <v-container pa-0 ma-0 id="commentContainer">
          <div v-for="comment in comments" :key="comment.id">
            <PostComment :comment="comment" />
          </div>
        </v-container>
      </div>
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
      <div class="body-1 py-4 grey--text">NO COMMENTS YET</div>
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
      firstTimeEntered: true,
      commentStreamCb: null,
      commentStreamEvent: null
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
    }
  },
  beforeDestroy () {
    if (this.commentStreamCb) {
      this.eventSource.removeEventListener(this.commentStreamEvent, this.commentStreamCb)
    }
  },
  async mounted () {
    await this.getComments()
    await this.addSSEListeners()
  },
  methods: {
    async addSSEListeners () {
      if (this.user) {
        await this.$store.dispatch('closeComments')
        this.commentStreamCb = (event) => {
          let streamedComments = JSON.parse(event.data)
          this.comments = streamedComments
          this.comments.forEach((comment) => {
            comment.sinceCreated = this.timeDifference(comment.createdAt)
          })
          console.log(streamedComments)
        }
        this.commentStreamEvent = 'comment'
        this.eventSource.addEventListener(this.commentStreamEvent, this.commentStreamCb)
      }
    },
    async createComment () { // TODO: error handling
      try {
        await CommentService.createComment(this.postId, {
          text: this.commentText
        })
        this.commentText = ''
        await this.getComments()
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async getComments () {
      try {
        console.log('called')
        let response
        response = await CommentService.getCommentsOfPost(this.postId)
        this.comments = response.data
        this.comments.forEach((comment) => {
          comment.sinceCreated = this.timeDifference(comment.createdAt)
        })
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async viewHandler (e) {
      if (e.type === 'enter') {
        if (this.firstTimeEntered) {
          console.log('FIRST TIME ENTERED')
          this.firstTimeEntered = !this.firstTimeEntered
        } else {
          await this.getComments()
          await this.addSSEListeners()
          console.log('ENTERED')
        }
      } else if (e.type === 'exit') {
        if (this.commentStreamCb) {
          this.eventSource.removeEventListener(this.commentStreamEvent, this.commentStreamCb)
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
    timeDifference (createdAt) {
      let msPerMinute = 60 * 1000
      let msPerHour = msPerMinute * 60
      let msPerDay = msPerHour * 24
      let msPerMonth = msPerDay * 30
      let msPerYear = msPerDay * 365
      let elapsed = Date.now() - (new Date(createdAt).getTime())
      if (elapsed < msPerMinute) {
        let time = Math.round(elapsed / 1000)
        if (time <= 15) return 'just now'
        else return time + ' seconds ago'
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
#commentContainer {
  overflow-y: auto;
  max-height: 500px;
}

</style>
