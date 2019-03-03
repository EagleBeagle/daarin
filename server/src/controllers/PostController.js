const Post = require('../models/Post.js')
//  const User = require('../models/User.js')

module.exports = {
  async index (req, res) {
    let posts = null
    try {
      posts = await Post.find().populate('createdBy', 'username').sort('-createdAt')
      for (let key in posts) {
        posts[key].populate('createdBy')
      }
      res.send(posts)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },
  async postStream (req, res) {
    let posts = null
    console.log('sse start?')
    res.sseSetup()
    const dataStream = setInterval(async function () { // TODO: jó lenne más megoldást találni (pl SetTimeout-tal)
      posts = await Post.find().populate('createdBy', 'username').sort('-createdAt')
      res.sseSend(posts)
    }, 2000)

    req.on('close', async () => {
      await clearInterval(dataStream)
      console.log('befejezve')
      res.end()
    })
  },
  upload (req, res) {
    const encoded = req.file.buffer.toString('base64')
    let newPost = new Post({
      title: req.body.title,
      createdBy: req.body.createdBy,
      content: 'data:image/png;base64, ' + encoded
    })

    newPost.save(function (err) {
      if (err) {
        res.status(500).send({
          error: 'An error occured during the upload.'
        })
      }
      res.status(201).json({ post: newPost })
    })
  },
  async upvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $push: { 'likes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async unUpvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'likes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async downvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $push: { 'dislikes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async unDownvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'dislikes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  }
}
