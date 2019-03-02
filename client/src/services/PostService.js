import Api from '@/services/Api'

export default {
  index () {
    return Api().get('/home')
  },
  upload (formData) {
    console.log('uploadService: ' + formData.get('createdBy'))
    return Api().post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  upvote (postId) {
    console.log(postId)
    return Api().put(`/posts/${postId}/upvote`)
  },
  unUpvote (postId) {
    console.log(postId)
    return Api().delete(`/posts/${postId}/upvote`)
  },
  downvote (postId) {
    return Api().put(`/posts/${postId}/downvote`)
  },
  unDownvote (postId) {
    return Api().delete(`/posts/${postId}/downvote`)
  }
}
