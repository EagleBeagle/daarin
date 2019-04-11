const mongoose = require('mongoose')
const Comment = require('../models/Comment.js')
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
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(10)
        let lastCommentToBeLoaded = comments[0]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        console.log(comments)
        setTimeout(() => {
          res.status(200).send(comments)
        }, 2000)
      } else if (oldestLoaded && !newestLoaded && !lowestLoaded && !highestLoaded) {
        comments = await Comment
          .find({
            'to': postId,
            'replyTo': null,
            'createdAt': { $lt: oldestLoaded }
          })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(10)
        let lastCommentToBeLoaded = comments[Object.keys(comments).length - 1]
        if (lastCommentToBeLoaded) {
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
        }
        setTimeout(() => {
          res.status(200).send(comments)
        }, 2000)
      } else if (highestLoaded && !newestLoaded && !oldestLoaded && !lowestLoaded) { // todo
        comments = await Comment // todo
          .aggregate( // todo
            [{
              $addFields: {
                score: { $substract: [ { $size: '$likes' }, { $size: '$dislikes' } ] }
              }
            }]
          )
          .sort('-score')
          .limit(10)
        res.status(200).send(comments)
      } else if (lowestLoaded && !highestLoaded && !newestLoaded && !oldestLoaded) {
        res.status(200).send('todo')
      } else if (!oldestLoaded && !newestLoaded && !lowestLoaded && !highestLoaded && (sortBy === 'date' || sortBy === 'relevancy')) {
        if (sortBy === 'date') {
          comments = await Comment
            .find({
              'to': postId,
              'replyTo': null
            })
            .populate('createdBy', 'username')
            .sort('-createdAt')
            .limit(10)
          SSEConnectionHandler.flushQuery('comment', sseId)
          SSEConnectionHandler.flushQuery('reply', sseId)
          await SSEConnectionHandler.buildAndSetConnectionQuery('comment', sseId, comments)
          setTimeout(function () {
            res.status(200).send(comments)
          }, 2000)
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
            .sort('-score')
            .limit(10)
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
    console.log('ENNEK VÁLASZOLUNK: ' + replyTo)

    try {
      if (replyTo) {
        let parent = await Comment.findOne({ '_id': replyTo })
        console.log(parent)
        console.log('szülő válasz erre: ' + parent.replyTo)
        if (parent.replyTo) { // nem mükszik
          console.log('ittvaguynk')
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
          .populate('createdBy', 'username')
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
          .populate('createdBy', 'username')
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
  }
}
