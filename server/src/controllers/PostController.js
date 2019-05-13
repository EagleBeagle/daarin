const cloudinary = require('cloudinary')
const Datauri = require('datauri')
const uniqueSlug = require('unique-slug')
const path = require('path')
const mongoose = require('mongoose')
const Post = require('../models/Post.js')
const User = require('../models/User.js')
const Comment = require('../models/Comment.js')
const Reaction = require('../models/Reaction.js')
const Recommendation = require('../models/Recommendation.js')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')

cloudinary.config({
  cloud_name: 'daarin',
  api_key: '744822548765916',
  api_secret: 'KTogd86JwWJzB0HJUYXI-puj084'
})

module.exports = {
  async newest (req, res) { // SSE-t megcsinálni
    let userId = req.user._id
    let posts = null
    let sseId = req.user ? req.user.sseId : null
    try {
      if (!req.query.created || !req.query.limit) { // TODO esetek
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
        SSEConnectionHandler.flushQuery('post', sseId)
        if (userId) {
          SSEConnectionHandler.buildAndSetConnectionQuery('popup', sseId, userId)
        }
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
      } else {
        /* posts = await Post.find({ 'createdAt': { $lt: req.query.created } })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(Number(req.query.limit)) */
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

  async recommended (req, res) {
    let userId = req.user._id
    let sseId = req.user.sseId
    let oldestLoaded = req.query.oldest
    let lowestLoaded = req.query.lowest
    try {
      if (!oldestLoaded && !lowestLoaded) {
        let posts = await Recommendation
          .aggregate([
            {
              $match: {
                userId: mongoose.Types.ObjectId(userId)
              }
            },
            {
              $lookup: {
                from: 'posts',
                localField: 'postId',
                foreignField: '_id',
                as: 'post'
              }
            },
            {
              $lookup: {
                from: 'reactions',
                localField: 'postId',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $unwind: '$post'
            },
            {
              $project: {
                _id: '$post._id',
                title: '$post.title',
                tags: '$post.tags',
                createdBy: '$post.createdBy',
                createdAt: '$post.createdAt',
                url: '$post.url',
                score: 1,
                reactions: '$reactions'
              }
            },
            {
              $sort: {
                score: -1,
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        /* let sseQuery = Post.find({}, 'likes dislikes')
          .sort('-createdAt')
          .limit(5) */
        SSEConnectionHandler.flushQuery('post', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        SSEConnectionHandler.buildAndSetConnectionQuery('popup', sseId, userId)
        res.status(200).send(posts)
      } else if (oldestLoaded && lowestLoaded) {
        let posts = await Recommendation
          .aggregate([
            {
              $match: {
                userId: mongoose.Types.ObjectId(userId)
              }
            },
            {
              $lookup: {
                from: 'posts',
                localField: 'postId',
                foreignField: '_id',
                as: 'post'
              }
            },
            {
              $lookup: {
                from: 'reactions',
                localField: 'postId',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $unwind: '$post'
            },
            {
              $project: {
                _id: '$post._id',
                title: '$post.title',
                tags: '$post.tags',
                createdBy: '$post.createdBy',
                createdAt: '$post.createdAt',
                url: '$post.url',
                score: 1,
                reactions: '$reactions'
              }
            },
            {
              $match: {
                $or: [
                  {
                    score: Number(lowestLoaded),
                    createdAt: { $lt: new Date(oldestLoaded) }
                  },
                  {
                    score: { $lt: Number(lowestLoaded) }
                  }
                ]
              }
            },
            {
              $sort: {
                score: -1,
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        let lastPost = posts[Object.keys(posts).length - 1] // ha üres akkor nincs több post
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        }
        res.status(200).send(posts)
      } else {
        res.status(400).send({
          error: 'Invalid query format.'
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async trending (req, res) {
    let sseId = req.user ? req.user.sseId : null
    let userId = req.user._id
    let oldestLoaded = req.query.oldest
    let lowestLoaded = req.query.lowest
    try {
      if (!oldestLoaded && !lowestLoaded) {
        let posts = await Post
          .aggregate([
            {
              $sort: {
                score: -1,
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
        SSEConnectionHandler.flushQuery('post', sseId)
        if (userId) {
          SSEConnectionHandler.buildAndSetConnectionQuery('popup', sseId, userId)
        }
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        res.status(200).send(posts)
      } else if (oldestLoaded && lowestLoaded) {
        let posts = await Post
          .aggregate([
            {
              $match: {
                $or: [
                  {
                    score: Number(lowestLoaded),
                    createdAt: { $lt: new Date(oldestLoaded) }
                  },
                  {
                    score: { $lt: Number(lowestLoaded) }
                  }
                ]
              }
            },
            {
              $sort: {
                score: -1,
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
        let lastPost = posts[Object.keys(posts).length - 1]
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        }
        res.status(200).send(posts)
      } else {
        res.status(400).send({
          error: 'Invalid query format.'
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async search (req, res) {
    let sseId = req.user ? req.user.sseId : null
    let text = req.query.query
    let createdAt = req.query.created
    try {
      if (!createdAt) {
        let results = await Post
          .aggregate([
            {
              $match: {
                $or: [
                  {
                    title: new RegExp(text, 'i')
                  },
                  {
                    tags: new RegExp(text, 'i')
                  }
                ]
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
        results = await Post.populate(results, { path: 'createdBy', select: 'username' })
        SSEConnectionHandler.flushQuery('post', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, results)
        res.status(200).send(results)
      } else {
        let results = await Post
          .aggregate([
            {
              $match: {
                createdAt: { $lt: new Date(createdAt) },
                $or: [
                  {
                    title: new RegExp(`${text}`)
                  },
                  {
                    tags: new RegExp(`${text}`)
                  }
                ]
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
        results = await Post.populate(results, { path: 'createdBy', select: 'username' })
        let lastPost = results[Object.keys(results).length - 1] // ha üres akkor nincs több post
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, results)
        }
        res.status(200).send(results)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error happened during the search.'
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
    let created = req.query.created
    try {
      if (userId && !created) { // TODO esetek
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
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        SSEConnectionHandler.flushQuery('post', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        res.status(200).send(posts)
      } else if (userId && created) {
        let posts = await Post
          .aggregate([
            {
              $match: {
                createdBy: mongoose.Types.ObjectId(userId),
                createdAt: { $lt: new Date(created) }
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
        res.status(200).send(posts)
      }
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async getReactedPostsOfUser (req, res) {
    console.log('ittvagyok')
    let sseId = req.user ? req.user.sseId : null
    let userId = req.params.userId
    let created = req.query.created
    try {
      if (userId && !created) { // TODO esetek
        let posts = await Post
          .aggregate([
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $match: {
                reactions: {
                  $elemMatch: { user: { $eq: mongoose.Types.ObjectId(userId) } }
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        SSEConnectionHandler.flushQuery('post', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        res.status(200).send(posts)
      } else if (userId && created) {
        let posts = await Post
          .aggregate([
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $match: {
                createdAt: { $lt: new Date(created) },
                reactions: {
                  $elemMatch: { user: { $eq: mongoose.Types.ObjectId(userId) } }
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        let lastPost = posts[Object.keys(posts).length - 1] // ha üres akkor nincs több post
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        }
        res.status(200).send(posts)
      }
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async getCommentedPostsOfUser (req, res) {
    console.log('ittvagyok')
    let sseId = req.user ? req.user.sseId : null
    let userId = req.params.userId
    let created = req.query.created
    try {
      if (userId && !created) { // TODO esetek
        let posts = await Post
          .aggregate([
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'to',
                as: 'comments'
              }
            },
            {
              $match: {
                comments: {
                  $elemMatch: { createdBy: { $eq: mongoose.Types.ObjectId(userId) } }
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        SSEConnectionHandler.flushQuery('post', sseId)
        SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        res.status(200).send(posts)
      } else if (userId && created) {
        let posts = await Post
          .aggregate([
            {
              $lookup: {
                from: 'reactions',
                localField: '_id',
                foreignField: 'to',
                as: 'reactions'
              }
            },
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'to',
                as: 'comments'
              }
            },
            {
              $match: {
                createdAt: { $lt: new Date(created) },
                comments: {
                  $elemMatch: { createdBy: { $eq: mongoose.Types.ObjectId(userId) } }
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $limit: 5
            }
          ])
        posts = await Post.populate(posts, { path: 'createdBy', select: 'username' })
        let lastPost = posts[Object.keys(posts).length - 1] // ha üres akkor nincs több post
        if (lastPost) {
          SSEConnectionHandler.buildAndSetConnectionQuery('post', sseId, posts)
        }
        res.status(200).send(posts)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async getPostsAdmin (req, res) {
    try {
      let posts = await Post.find({}, { title: 1, reports: 1, createdAt: 1, createdBy: 1 }).populate('createdBy', 'username')
      res.status(200).send(posts)
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },

  async upload (req, res) {
    const dUri = new Datauri()
    dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer)

    try {
      let result = await cloudinary.v2.uploader.upload(dUri.content, {
        folder: 'posts'
      })
      let tags
      if (req.body.tags) {
        tags = [...new Set(JSON.parse(req.body.tags))]
      } else {
        tags = []
      }
      let newPost = {
        title: req.body.title,
        slug: uniqueSlug(req.body._id),
        createdBy: req.body.createdBy,
        tags: tags,
        url: result.url
      }
      console.log(result)
      newPost = await Post.create(newPost)
      res.status(201).send(newPost)
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
        let post = await Post.findOne({ _id: postId })
        await User.findOneAndUpdate({ _id: post.createdBy }, { $inc: { 'reactionCount': 1 } })
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
        let post = await Post.findOne({ _id: postId })
        await User.findOneAndUpdate({ _id: post.createdBy }, { $inc: { 'reactionCount': -1 } })
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

  async report (req, res) {
    let userId = req.user._id
    let postId = req.params.postId
    if (!postId || postId.length !== 24) {
      res.status(400).send()
    } else {
      try {
        let post = await Post.findOne({ _id: postId })
        if (post) {
          let stringReports = post.reports.map(report => String(report))
          if (!stringReports.includes(String(userId))) {
            await post.update({ $addToSet: { reports: userId } })
            await User.findOneAndUpdate({ _id: post.createdBy }, { $inc: { reportCount: 1 } })
          }
          res.status(200).send({
            success: true
          })
        } else {
          res.status(400).send()
        }
      } catch (err) {
        console.log(err)
        if (err.name === 'MongoError') {
          res.status(400).send({
            error: 'You already reported this post.'
          })
        } else {
          res.status(500).send({
            error: 'An error occured during the report.'
          })
        }
      }
    }
  },

  async delete (req, res) {
    let userId = req.user._id
    let postId = req.params.postId
    if (!postId || postId.length !== 24) {
      res.status(400).send()
    } else {
      try {
        let post = await Post.findOne({ _id: postId })
        if (post && (String(post.createdBy) === String(userId) || req.user.admin)) {
          await post.delete()
          await Comment.deleteMany({ to: post._id })
          let reactionResult = await Reaction.deleteMany({ to: post._id })
          console.log(reactionResult)
          let deletedReactionCount = reactionResult.n
          if (deletedReactionCount) {
            await User.findOneAndUpdate({ _id: userId }, { $inc: { reactionCount: (-1 * deletedReactionCount) } })
          }
          let cloudId = 'posts/' + post.url.split('posts/')[1].split('.')[0]
          await cloudinary.v2.uploader.destroy(cloudId)
          console.log(cloudId)
          res.status(200).send({
            success: true
          })
        } else {
          res.status(400).send()
        }
      } catch (err) {
        res.status(500).send({
          error: 'An error occured during the deletion.'
        })
      }
    }
  }
}
