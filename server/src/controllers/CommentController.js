const mongoose = require('mongoose')
const Comment = require('../models/Comment.js')
const User = require('../models/User.js')
// const Post = require('../models/Post.js')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')

module.exports = {
  async getCommentsOfPost (req, res) {
    let comments = null
    let sseId = req.user ? req.user.sseId : null
    let postId = req.params.postId
    let newestLoaded = req.query.newest
    let oldestLoaded = req.query.oldest
    let highestLoaded = req.query.highest
    let lowestLoaded = req.query.lowest
    let sortBy = req.query.sortBy
    try {
      if (newestLoaded && !oldestLoaded && !lowestLoaded && !highestLoaded) {
        comments = await Comment
          .find({
            'to': postId,
            'replyTo': null,
            'createdAt': { $gt: newestLoaded }
          })
          .populate('createdBy', 'username avatar')
          .sort('-createdAt')
          .limit(10)
        let lastCommentToBeLoaded = comments[0]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        res.status(200).send(comments)
      } else if (oldestLoaded && !newestLoaded && !lowestLoaded && !highestLoaded) {
        comments = await Comment
          .find({
            'to': postId,
            'replyTo': null,
            'createdAt': { $lt: oldestLoaded }
          })
          .populate('createdBy', 'username avatar')
          .sort('-createdAt')
          .limit(10)
        let lastCommentToBeLoaded = comments[Object.keys(comments).length - 1]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        res.status(200).send(comments)
      } else if (highestLoaded && newestLoaded && !oldestLoaded && !lowestLoaded) {
        comments = await Comment
          .aggregate([
            {
              $addFields: {
                score: { $subtract: [ { $size: '$likes' }, { $size: '$dislikes' } ] }
              }
            },
            {
              $match: {
                $or: [
                  {
                    to: mongoose.Types.ObjectId(postId),
                    replyTo: null,
                    score: Number(highestLoaded),
                    createdAt: { $gt: new Date(newestLoaded) }
                  },
                  {
                    to: mongoose.Types.ObjectId(postId),
                    replyTo: null,
                    score: { $gt: Number(highestLoaded) }
                  }
                ]
              }
            }
          ])
          .sort({
            'score': -1,
            'createdAt': -1
          })
          .limit(10)
        comments = await Comment.populate(comments, { path: 'createdBy', select: 'username avatar' })
        let lastCommentToBeLoaded = comments[0]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        res.status(200).send(comments)
      } else if (lowestLoaded && oldestLoaded && !highestLoaded && !newestLoaded) {
        comments = await Comment
          .aggregate([
            {
              $addFields: {
                score: { $subtract: [ { $size: '$likes' }, { $size: '$dislikes' } ] }
              }
            },
            {
              $match: {
                $or: [
                  {
                    to: mongoose.Types.ObjectId(postId),
                    replyTo: null,
                    score: Number(lowestLoaded),
                    createdAt: { $lt: new Date(oldestLoaded) }
                  },
                  {
                    to: mongoose.Types.ObjectId(postId),
                    replyTo: null,
                    score: { $lt: Number(lowestLoaded) }
                  }
                ]
              }
            }
          ])
          .sort({
            'score': -1,
            'createdAt': -1
          })
          .limit(10)
        comments = await Comment.populate(comments, { path: 'createdBy', select: 'username avatar' })
        let lastCommentToBeLoaded = comments[0]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        res.status(200).send(comments)
      } else if (!oldestLoaded && !newestLoaded && !lowestLoaded && !highestLoaded && (sortBy === 'date' || sortBy === 'relevancy')) {
        if (sortBy === 'date') {
          comments = await Comment
            .find({
              'to': postId,
              'replyTo': null
            })
            .populate('createdBy', 'username avatar')
            .sort('-createdAt')
            .limit(10)
          SSEConnectionHandler.flushQuery('comment', sseId)
          SSEConnectionHandler.flushQuery('reply', sseId)
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
          res.status(200).send(comments)
        } else {
          comments = await Comment
            .aggregate([
              {
                $match: {
                  to: mongoose.Types.ObjectId(postId),
                  replyTo: null
                }
              },
              {
                $addFields: {
                  score: { $subtract: [ { $size: '$likes' }, { $size: '$dislikes' } ] }
                }
              }]
            )
            .sort({
              'score': -1,
              'createdAt': -1
            })
            .limit(10)
          comments = await Comment.populate(comments, { path: 'createdBy', select: 'username avatar' })
          SSEConnectionHandler.flushQuery('comment', sseId)
          SSEConnectionHandler.flushQuery('reply', sseId)
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
          res.status(200).send(comments)
        }
      } else {
        res.status(400).send({
          error: 'Invalid query format.'
        })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        eror: 'an error has occured trying to fetch comments'
      })
    }
  },

  async createComment (req, res) {
    let postId = req.params.postId
    let replyTo = req.body.replyTo
    let sseId = req.user ? req.user.sseId : null

    try {
      if (replyTo) {
        let parent = await Comment.findOne({ '_id': replyTo })
        if (parent.replyTo) { // nem mükszik
          res.status(400).send({
            error: 'you cannot reply to a reply'
          })
        } else {
          let newComment = {
            text: req.body.text,
            createdBy: req.user._id,
            to: parent.to,
            replyTo: replyTo
          }
          newComment = await Comment.create(newComment)
          await SSEConnectionHandler.buildAndSetConnectionQuery('reply', sseId, [newComment])
          await Comment.findOneAndUpdate({ '_id': replyTo }, { $inc: { 'replyCount': 1 } })
          res.status(200).send({ comment: newComment })
        }
      } else {
        let newComment = {
          text: req.body.text,
          to: postId,
          createdBy: req.user._id
        }
        newComment = await Comment.create(newComment)
        await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, [newComment])
        res.status(201).send({ comment: newComment })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured while posting the comment.'
      })
    }
  },
  /*
  MEGOLDANI: több reply-containert láthatunk egyszerre,
             tömb a reply query-knek sse-ben, vue-ban meg
             hozzáadni a listenereket a replycontainerhez,
             ha nem látszik a container bontani az event listening-et
  */
  async getRepliesOfComment (req, res) {
    let commentId = req.params.commentId
    let newestLoaded = req.query.newest
    let sseId = req.user ? req.user.sseId : null
    let replies
    try {
      if (newestLoaded) {
        replies = await Comment
          .find({
            'replyTo': commentId,
            'createdAt': { $gt: newestLoaded }
          })
          .populate('createdBy', 'username avatar')
          .sort('createdAt')
          .limit(10)
        let lastReplyToBeLoaded = replies[Object.keys(replies).length - 1]
        if (lastReplyToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('reply', sseId, replies) // todo
        }
        res.status(200).send(replies)
      } else {
        replies = await Comment
          .find({ 'replyTo': commentId })
          .populate('createdBy', 'username avatar')
          .sort('createdAt')
          .limit(10)
        await SSEConnectionHandler.buildAndSetConnectionQuery('reply', sseId, replies) // todo
        res.status(200).send(replies)
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured while fetching the comments.'
      })
    }
  },

  async getCommentsAdmin (req, res) {
    try {
      let comments = await Comment.find({}, { text: 1, reports: 1, createdBy: 1, createdAt: 1, to: 1 }).populate('createdBy', 'username')
      res.status(200).send(comments)
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured while fetching the comments.'
      })
    }
  },

  async upvote (req, res) {
    try {
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $addToSet: { 'likes': req.user.id } })
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $pull: { 'dislikes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid comment'
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
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $pull: { 'likes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid comment'
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
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $addToSet: { 'dislikes': req.user.id } })
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $pull: { 'likes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid comment'
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
      await Comment.findOneAndUpdate({ '_id': req.params.commentId }, { $pull: { 'dislikes': req.user.id } })
      res.status(204).json({ success: true })
    } catch (err) { //  TODO
      if (err.name === 'CastError') {
        res.status(400).send({
          error: 'Invalid comment'
        })
      } else {
        res.status(500).send({
          error: 'An error occured trying to remove the downvote'
        })
      }
    }
  },
  async report (req, res) {
    let userId = req.user._id
    let commentId = req.params.commentId
    if (!commentId || commentId.length !== 24) {
      res.status(400).send()
    } else {
      try {
        let comment = await Comment.findOne({ _id: commentId })
        if (comment) {
          let stringReports = comment.reports.map(report => String(report))
          if (!stringReports.includes(String(userId))) {
            await comment.update({ $addToSet: { reports: userId } })
            await User.findOneAndUpdate({ _id: comment.createdBy }, { $inc: { reportCount: 1 } })
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
    let commentId = req.params.commentId
    if (!commentId || commentId.length !== 24) {
      res.status(400).send()
    } else {
      try {
        let comment = await Comment.findOne({ _id: commentId })
        if (comment && String(comment.createdBy === String(userId))) {
          await comment.delete()
          await Comment.deleteMany({ replyTo: comment._id })
          if (comment.replyTo) {
            await Comment.findOneAndUpdate({ _id: comment.replyTo }, { $inc: { replyCount: -1 } })
          }
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
