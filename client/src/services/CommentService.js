import Api from '@/services/Api'
import querystring from 'querystring'

export default {
  getCommentsOfPost (commentData) {
    let query = ''
    if (commentData.newest && commentData.oldest && commentData.get) {
      let newestCreated = querystring.stringify({ newest: commentData.newest.createdAt })
      let oldestCreated = querystring.stringify({ oldest: commentData.oldest.createdAt })
      console.log('mindenmegvan')
      query = `?${newestCreated}&${oldestCreated}&get=${commentData.get}`
    } else if (commentData.newest) {
      let newestCreated = querystring.stringify({ newest: commentData.newest.createdAt })
      query = `?${newestCreated}`
    } else if (commentData.oldest) {
      let oldestCreated = querystring.stringify({ oldest: commentData.oldest.createdAt })
      query = `?${oldestCreated}`
    } else if (commentData.highest && commentData.lowest) {
      console.log('todo')
    }
    return Api().get(`/posts/${commentData.postId}/comments${query}`)
  },
  createComment (postId, commentData) {
    return Api().post(`/posts/${postId}/comments`, commentData)
  },
  getRepliesOfComment (postId, commentId) {
    return Api().get(`/posts/${postId}/comments/${commentId}/replies`)
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
