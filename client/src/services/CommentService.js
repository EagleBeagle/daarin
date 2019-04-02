import Api from '@/services/Api'

export default {
  getCommentsOfPost (postId) {
    return Api().get(`/posts/${postId}/comments`)
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
