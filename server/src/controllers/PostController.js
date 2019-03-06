const Post = require('../models/Post.js')
const { setIntervalSync } = require('../utils/common.js')
//  const User = require('../models/User.js')
let sseConnections = {}

module.exports = {
  async index (req, res) {
    let posts = null
    let userId = req.user ? req.user._id : null
    console.log('KUKUKUKUKUKUI: ' + req.session.id)
    try {
      let query = Post.find().populate('createdBy', 'username').sort('-createdAt') // ez query-t ad vissza mert nem kezeljük le a promise-t
      if (userId) sseConnections[userId] = query
      posts = await query.exec()
      // console.log(await sseDbQuery.exec())
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
    console.log('sse start')
    res.sseSetup()
    let userId = req.query.user
    console.log('usasdasoidjadisa: ' + userId)
    /* if (userId && !(userId in sseConnections)) {
      console.log('vanuserid és még nincs coneccekben')
      sseConnections[userId] = null
    } */
    const intervalClear = setIntervalSync(async function () {
      try {
        let dataToSend = null
        if (!sseConnections[userId]) {
          userId = 'message'
          dataToSend = ''
        } else {
          dataToSend = await sseConnections[userId].exec()
        }
        console.log(userId + ' ' + (userId in sseConnections) + ', cookie: ' + req.session.id)
        res.sseSend(userId, dataToSend)
      } catch (err) {
        console.log(err)
        res.sseSend('error', {
          error: 'an error has occured while fetching data'
        })
        await intervalClear()
        delete sseConnections[userId]
        res.end()
      }
    }, 2000)

    req.on('close', async () => {
      await intervalClear()
      delete sseConnections[userId]
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
      sseConnections[req.user._id] = Post.find({ 'title': 'das' }).populate('createdBy', 'username').sort('-createdAt')
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
