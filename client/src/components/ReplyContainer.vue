<template>
  <v-container v-if="comments && comments.length" class="pa-0 pl-5 ma-0">
    <div v-bar id="vb">
      <div v-for="comment in comments" :key="comment.id">
        <PostComment :comment="comment" />
      </div>
    </div>
  </v-container>
</template>

<script>
import CommentService from '@/services/CommentService'
export default {
  name: 'replyContainer',
  data () {
    return {
      comments: null
    }
  },
  props: [
    'postId',
    'replyTo'
  ],
  async mounted () {
    await this.getReplies()
  },
  methods: {
    async getReplies () {
      try {
        let response
        response = await CommentService.getRepliesOfComment(this.postId, this.replyTo)
        this.comments = response.data
        this.comments.forEach((comment) => {
          comment.sinceCreated = this.timeDifference(comment.createdAt)
        })
      } catch (error) {
        console.log('BAJ VAN: ' + error)
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
    PostComment: () => import('./PostComment')
  }
}

</script>

<style scoped>

</style>
