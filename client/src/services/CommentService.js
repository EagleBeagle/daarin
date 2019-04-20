import Api from '@/services/Api'
import querystring from 'querystring'

export default {
  getCommentsOfPost (commentData) {
    let query = ''
    if (commentData.newest) {
      let newestCreated = querystring.stringify({ newest: commentData.newest.createdAt })
      query = `?${newestCreated}`
    } else if (commentData.oldest) {
      let oldestCreated = querystring.stringify({ oldest: commentData.oldest.createdAt })
      query = `?${oldestCreated}`
    } else if (commentData.highest) {
      let highestScored = querystring.stringify({ highest: commentData.highest.likes.length - commentData.highest.dislikes.length })
      let newestCreated = querystring.stringify({ newest: commentData.highest.createdAt })
      query = `?${highestScored}&${newestCreated}`
    } else if (commentData.lowest) {
      let lowestScored = querystring.stringify({ lowest: commentData.lowest.likes.length - commentData.lowest.dislikes.length })
      let oldestCreated = querystring.stringify({ oldest: commentData.lowest.createdAt })
      query = `?${lowestScored}&${oldestCreated}`
    } else {
      let sortBy = querystring.stringify({ sortBy: commentData.sortBy })
      query = `?${sortBy}`
    }
    return Api().get(`/posts/${commentData.postId}/comments${query}`)
  },
  createComment (postId, commentData) {
    return Api().post(`/posts/${postId}/comments`, commentData)
  },
  getRepliesOfComment (replyData) {
    let query = ''
    let postId = replyData.postId
    let commentId = replyData.commentId
    let createdAt = replyData.createdAt
    if (createdAt) {
      let newestCreated = querystring.stringify({ newest: createdAt })
      query = `?${newestCreated}`
    }
    return Api().get(`/posts/${postId}/comments/${commentId}/replies${query}`)
  },
  upvote (postId, commentId) {
    console.log(commentId)
    return Api().put(`/posts/${postId}/comments/${commentId}/upvote`)
  },
  unUpvote (postId, commentId) {
    console.log(postId)
    return Api().delete(`/posts/${postId}/comments/${commentId}/upvote`)
  },
  downvote (postId, commentId) {
    return Api().put(`/posts/${postId}/comments/${commentId}/downvote`)
  },
  unDownvote (postId, commentId) {
    return Api().delete(`/posts/${postId}/comments/${commentId}/downvote`)
  }
}
