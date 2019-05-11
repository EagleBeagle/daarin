<template>
  <v-container class="pa-0 ma-0">
    <v-container v-if="replies && replies.length" class="pa-0 pl-5 ma-0">
        <div v-for="reply in replies" :key="reply.id">
          <PostComment :comment="reply"/>
        </div>
    </v-container>
    <div
      v-if="isMoreAvailable"
      class="grey--text subheading py-1"
      style="cursor: pointer"
      @click="getNewerReplies()">
      see more replies
    </div>
  </v-container>
</template>

<script>
import CommentService from '@/services/CommentService'
import {mapState} from 'vuex'
export default {
  name: 'replyContainer',
  props: [
    'postId',
    'replyTo'
  ],
  data () {
    return {
      replies: null,
      replyStreamCb: null,
      replyStreamEvent: null,
      lastLoadedReply: null,
      isMoreAvailable: false,
      locallyAddedReplies: []
    }
  },
  computed: {
    ...mapState([
      'user',
      'eventSource',
      'replyStreamExists',
      'replyStreamData',
      'localReply',
      'deletedReply'
    ])
  },
  watch: {
    replyStreamData (data) {
      if (this.replies) {
        let streamedReplies = JSON.parse(JSON.stringify(data))
        streamedReplies.forEach((streamedReply) => {
          let loadedReply = this.replies.find(loadedReply => loadedReply._id === streamedReply._id)
          if (loadedReply) {
            loadedReply.likes = streamedReply.likes
            loadedReply.dislikes = streamedReply.dislikes
            loadedReply.sinceCreated = this.timeDifference(streamedReply.createdAt)
          }
        })
        console.log(this.replyTo.replyCount)
        console.log(this.replies.length)
        if (this.replyTo.replyCount > this.replies.length) {
          this.isMoreAvailable = true
        }
        console.log(streamedReplies)
      }
      /* this.replies.forEach((reply) => {
        let streamedReply = streamedReplies.find(streamedReply => streamedReply._id === reply._id)
        if (streamedReply) {
          reply.likes = streamedReply.likes
          reply.dislikes = streamedReply.dislikes
          reply.sinceCreated = this.timeDifference(streamedReply.createdAt)
        } else if (streamedReply.replyTo === this.post_id) {
          this.isMoreAvailable = true
        }
      })
      streamedReplies. */
    },
    localReply (reply) {
      if (reply && reply.replyTo === this.replyTo._id) {
        console.log(reply)
        let localReply = JSON.parse(JSON.stringify(reply))
        localReply.createdBy = {
          username: this.user.username,
          avatar: this.user.avatar,
          _id: this.user._id
        }
        localReply.sinceCreated = this.timeDifference(localReply.createdAt)
        let re = new RegExp('^@\\w+')
        let match = localReply.text.match(re)
        if (match) {
          localReply.text = localReply.text.replace(match, '')
          localReply.replyUsername = match
        }
        this.locallyAddedReplies.push(localReply._id)
        this.replies = [...this.replies, localReply]
        console.log(this.replies)
      }
    },
    deletedReply (newVal, oldVal) {
      if (newVal && (oldVal !== newVal)) {
        this.replies = this.replies.filter(reply => reply._id !== this.deletedReply)
      }
    }
  },
  async mounted () {
    await this.getReplies()
    await this.addSSEListeners()
  },
  methods: {
    async addSSEListeners () {
      console.log(this.replyStreamExists)
      if (!this.replyStreamExists) {
        console.log('addolunk')
        await this.$store.dispatch('addReplyListener')
      }
      /* if (this.user) {
        this.replyStreamCb = (event) => {
          let streamedReplies = JSON.parse(event.data)
          streamedReplies.forEach((reply) => {
            reply.sinceCreated = this.timeDifference(reply.createdAt)
          })
          this.replies.forEach((reply) => {
            let streamedReply = streamedReplies.find(streamedReply => streamedReply._id === reply._id)
            if (streamedReply) {
              reply.likes = streamedReply.likes
              reply.dislikes = streamedReply.dislikes
              reply.sinceCreated = this.timeDifference(streamedReply.createdAt)
            }
          })
          console.log(streamedReplies)
        }
        this.replyStreamEvent = 'reply'
        this.eventSource.addEventListener(this.replyStreamEvent, this.replyStreamCb)
      } */
    },
    async getReplies () {
      try {
        let response
        response = await CommentService.getRepliesOfComment({
          postId: this.postId,
          commentId: this.replyTo._id
        })
        this.replies = response.data

        if (this.replyTo.replyCount > this.replies.length) {
          this.isMoreAvailable = true
        }

        if (this.replies.length) {
          this.replies.forEach((reply) => {
            reply.sinceCreated = this.timeDifference(reply.createdAt)
            let re = new RegExp('^@\\w+')
            let match = reply.text.match(re)
            if (match) {
              reply.text = reply.text.replace(match, '')
              reply.replyUsername = match
            }
            /* reply.text = reply.text.replace(re, (match) => {
              reply.replyUsername = match
              console.log(reply.replyUsername)
              return ''
            })
            console.log('REPLYTEXT: ' + reply.text) */
          })
          this.lastLoadedReply = this.replies[this.replies.length - 1]
        }
      } catch (error) {
        console.log('BAJ VAN: ' + error)
      }
    },
    async getNewerReplies () {
      try {
        let response
        response = await CommentService.getRepliesOfComment({
          postId: this.postId,
          commentId: this.replyTo._id,
          createdAt: this.lastLoadedReply.createdAt
        })
        let newReplies = response.data

        newReplies = newReplies.filter(reply => !this.locallyAddedReplies.includes(reply._id))
        newReplies.forEach((reply, index) => {
          reply.sinceCreated = this.timeDifference(reply.createdAt)
          let re = new RegExp('^@\\w+')
          let match = reply.text.match(re)
          if (match) {
            reply.text = reply.text.replace(match, '')
            reply.replyUsername = match
          }
        })
        if (newReplies[0]) {
          this.lastLoadedReply = newReplies[newReplies.length - 1]
        }
        this.replies = [...this.replies, ...newReplies]
        this.isMoreAvailable = false
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
