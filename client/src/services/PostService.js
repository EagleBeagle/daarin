import Api from '@/services/Api'
import querystring from 'querystring'

export default {
  getPosts (lastPost, limit) {
    let query = ''
    if (lastPost) {
      let createdAt = querystring.stringify({ created: lastPost.createdAt })
      query = `?${createdAt}&limit=${limit}`
    }
    return Api().get(`/home${query}`)
  },
  getRecommendedPosts (postData) {
    let query = ''
    if (postData) {
      let oldestCreated = querystring.stringify({ oldest: postData.oldest })
      let lowestScored = querystring.stringify({ lowest: postData.lowest })
      query = `?${oldestCreated}&${lowestScored}`
    }
    return Api().get(`/recommended${query}`)
  },
  getPost (postId) {
    return Api().get(`/posts/${postId}`)
  },
  getPostsAdmin () {
    return Api().get(`/admin/posts`)
  },
  searchPosts (text, lastPost) {
    let query = `?${querystring.stringify({ query: text })}`
    if (lastPost) {
      let createdAt = querystring.stringify({ created: lastPost.createdAt })
      query += `&${createdAt}`
    }
    return Api().get(`/search${query}`)
  },
  getPostsOfUser (postData) {
    let query = ''
    if (postData.lastPost) {
      let createdAt = querystring.stringify({ created: postData.lastPost.createdAt })
      query += `?${createdAt}`
    }
    return Api().get(`/posts/user/${postData.userId}${query}`)
  },
  getReactedPostsOfUser (postData) {
    let query = ''
    if (postData.lastPost) {
      let createdAt = querystring.stringify({ created: postData.lastPost.createdAt })
      query += `?${createdAt}`
    }
    return Api().get(`/posts/reacted/user/${postData.userId}${query}`)
  },
  getCommentedPostsOfUser (postData) {
    let query = ''
    if (postData.lastPost) {
      let createdAt = querystring.stringify({ created: postData.lastPost.createdAt })
      query += `?${createdAt}`
    }
    return Api().get(`/posts/commented/user/${postData.userId}${query}`)
  },
  upload (formData) {
    return Api().post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  report (postId) {
    return Api().put(`/posts/${postId}/report`)
  },
  delete (postId) {
    return Api().delete(`/posts/${postId}`)
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
