const cloudinary = require('cloudinary')
const Datauri = require('datauri')
const uniqueSlug = require('unique-slug')
const path = require('path')
const mongoose = require('mongoose')
const Post = require('../models/Post.js')
const User = require('../models/User.js')
const Reaction = require('../models/Reaction.js')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')

cloudinary.config({
  cloud_name: 'daarin',
  api_key: '744822548765916',
  api_secret: 'KTogd86JwWJzB0HJUYXI-puj084'
})

module.exports = {
  async index (req, res) { // SSE-t megcsinálni
    let posts = null
    let sseId = req.user ? req.user.sseId : null
    try {
      if (!req.query.user || !req.query.created || !req.query.limit) { // TODO esetek
        posts = await Post.find()
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(5) // ez query-t ad vissza mert nem kezeljük le a promise-t
        // if (sseId) sseConnections[sseId] = Post.find({}, 'likes dislikes').sort('-createdAt').limit(5)
        posts = await Post
          .aggregate([
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            },
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        /* let sseQuery = Post.find({}, 'likes dislikes')
          .sort('-createdAt')
          .limit(5) */
        SSEConnectionHandler.flushQuery('comment', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
      } else {
        posts = await Post.find({ 'createdAt': { $lt: req.query.created } })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(Number(req.query.limit))

        posts = await Post
          .aggregate([
            {
              $match: {
                createdAt: { $lt: new Date(req.query.created) }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            },
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        let lastPost = posts[Object.keys(posts).length - 1] // ha üres akkor nincs több post
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
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

  async getPost (req, res) {
    let sseId = req.user ? req.user.sseId : null
    try {
      let postId = req.params.postId
      let post = await Post
        .aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(postId)
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'to',
              as: 'reactions'
            }
          }
        ])
      post = await Post.populate(post, { path: 'createdBy', select: 'username' })
      SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, post)
      if (!post.length) {
        res.status(400).send({
          error: "the given post doesn't exist"
        })
      } else {
        res.status(200).send(post)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the post'
      })
    }
  },

  async getPostsOfUser (req, res) {
    console.log('ittvagyok')
    let sseId = req.user ? req.user.sseId : null
    let userId = req.params.userId
    try {
      let posts = await Post
        .aggregate([
          {
            $match: {
              createdBy: mongoose.Types.ObjectId(userId)
            }
          },
          {
            $lookup: {
              from: 'reactions',
              localField: '_id',
              foreignField: 'to',
              as: 'reactions'
            }
          },
          {
            $sort: {
              createdAt: -1
            }
          }
        ])
      posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
      SSEConnectionHandler.flushQuery('post', sseId)
      SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
      res.status(200).send(posts)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async upload (req, res) {
    const dUri = new Datauri()
    dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer)

    try {
      let result = await cloudinary.v2.uploader.upload(dUri.content)
      let newPost = {
        title: req.body.title,
        slug: uniqueSlug(req.body._id),
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

  async react (req, res) {
    let type = Number(req.params.type)
    let postId = req.params.postId
    try {
      if (type >= 0 && type <= 6) {
        let reaction = {
          user: req.user._id,
          to: postId,
          type: type
        }
        await Reaction.create(reaction)
        res.status(201).send({
          success: true
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error occured trying to save the reaction.'
      })
    }
  },

  async unReact (req, res) {
    let type = Number(req.params.type)
    let postId = req.params.postId
    try {
      if (type >= 0 && type <= 6) {
        await Reaction.deleteOne({
          to: postId,
          user: req.user._id,
          type: type
        })
        res.status(204).send()
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error occured trying to delete the reaction.'
      })
    }
  },

  async upvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $addToSet: { 'likes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $addToSet: { 'likedPosts': req.params.postId } })
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'dislikes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'dislikedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid post'
        })
      } else {
        res.status(500).send({
          error: 'An error occured trying to upvote'
        })
      }
    }
  },
  async unUpvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'likes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'likedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid post'
        })
      } else {
        res.status(500).send({
          error: 'An error occured trying to remove the upvote'
        })
      }
    }
  },
  async downvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $addToSet: { 'dislikes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $addToSet: { 'dislikedPosts': req.params.postId } })
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'likes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'likedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid post'
        })
      } else {
        res.status(500).send({
          error: 'An error occured trying to downvote'
        })
      }
    }
  },
  async unDownvote (req, res) {
    try {
      await Post.findOneAndUpdate({ '_id': req.params.postId }, { $pull: { 'dislikes': req.user.id } })
      await User.findOneAndUpdate({ '_id': req.user.id }, { $pull: { 'dislikedPosts': req.params.postId } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid post'
        })
      } else {
        res.status(500).send({
          error: 'An error occured trying to remove the downvote'
        })
      }
    }
  }
}
