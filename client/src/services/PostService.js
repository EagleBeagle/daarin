import Api from '@/services/Api'
import querystring from 'querystring'

export default {
  index (lastPost, limit) {
    let query = ''
    if (lastPost) {
      let createdAt = querystring.stringify({ created: lastPost.createdAt })
      query = `?${createdAt}&limit=${limit}`
    }
    return Api().get(`/home${query}`)
  },
  getPost (postId) {
    return Api().get(`/posts/${postId}`)
  },
  upload (formData) {
    console.log('uploadService: ' + formData.get('createdBy'))
    return Api().post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  react (reactData) {
    return Api().put(`/posts/${reactData.postId}/reaction/${reactData.type}`)
  },
  unReact (reactData) {
    return Api().delete(`/posts/${reactData.postId}/reaction/${reactData.type}`)
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
