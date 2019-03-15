const cloudinary = require('cloudinary')
const Datauri = require('datauri')
const path = require('path')
const Post = require('../models/Post.js')
const { setIntervalSync } = require('../utils/common.js')
const User = require('../models/User.js')
let sseConnections = {}

cloudinary.config({
  cloud_name: 'daarin',
  api_key: '744822548765916',
  api_secret: 'KTogd86JwWJzB0HJUYXI-puj084'
})

module.exports = {
  async index (req, res) {
    let posts = null
    let sseId = req.user ? req.user.sseId : null
    let query = null
    try {
      if (!req.query.created || !req.query.limit) {
        query = Post.find()
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(5) // ez query-t ad vissza mert nem kezeljük le a promise-t
        if (sseId) sseConnections[sseId] = query
        posts = await query.exec()
      } else {
        posts = await Post.find({ 'createdAt': { $lt: req.query.created } })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(Number(req.query.limit))
        let lastPost = posts[Object.keys(posts).length - 1] // ha üres akkor nincs több post
        if (sseId && lastPost) {
          sseConnections[sseId] = Post.find({ 'createdAt': { $gte: lastPost.createdAt } })
            .populate('createdBy', 'username')
            .sort('-createdAt')
        }
      }
      res.status(200).send(posts)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async postStream (req, res) {
    console.log('SSE connection initialized')
    res.sseSetup()
    let sseId = req.query.id

    const intervalClear = setIntervalSync(async function () {
      try {
        if (!(sseId in sseConnections)) {
          res.sseSend('message', null)
        } else {
          let data = await sseConnections[sseId].exec()
          res.sseSend('message', data)
        }
      } catch (err) {
        console.log(err)
        res.sseSend('error', {
          error: 'an error has occured while streaming data'
        })
        await intervalClear()
        delete sseConnections[sseId]
        res.end()
      }
    }, 2000)

    req.on('close', async () => {
      await intervalClear()
      delete sseConnections[sseId]
      console.log('SSE Connection closed')
      res.end()
    })

    /* const intervalClear = setIntervalSync(async function () {
      try {
        let dataToSend = null
        if (!(sseId in sseConnections)) {
          sseId = 'message'
          dataToSend = ''
        } else {
          dataToSend = await sseConnections[sseId].exec()
        }
        console.log(sseId + ' ' + (sseId in sseConnections))
        res.sseSend('message', dataToSend)
      } catch (err) {
        console.log(err)
        res.sseSend('error', {
          error: 'an error has occured while fetching data'
        })
        await intervalClear()
        delete sseConnections[sseId]
        res.end()
      }
    }, 2000)

    req.on('close', async () => {
      await intervalClear()
      delete sseConnections[sseId]
      console.log('befejezve')
      res.end()
    }) */
  },
  async upload (req, res) {
    const dUri = new Datauri()
    dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer)

    try {
      let result = await cloudinary.v2.uploader.upload(dUri.content)
      let newPost = {
        title: req.body.title,
        createdBy: req.body.createdBy,
        url: result.url
      }
      await Post.create(newPost)
      res.status(201).json({ post: newPost })
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error occured during the upload.'
      })
    }
  },
  // TODO: ÚJRAGONDOLNI AZ UPVOTOK TÁROLÁSÁT
  async upvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $push: { 'likes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $push: { 'likedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async unUpvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'likes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'likedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async downvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $push: { 'dislikes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $push: { 'dislikedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  },
  async unDownvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'dislikes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'dislikedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      console.log(err)
      res.status(500)
    }
  }
}
