const Comment = require('../models/Comment.js')
// const Post = require('../models/Post.js')
const SSEConnectionHandler = require('../utils/SSEConnectionHandler.js')

module.exports = {
  async getCommentsOfPost (req, res) {
    let comments = null
    let sseId = req.user ? req.user.sseId : null
    let postId = req.params.postId
    try {
      if (!req.query.created || !req.query.limit) {
        comments = await Comment
          .find({ 'to': postId, 'replyTo': null })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(10)
        let sseQuery = Comment
          .find({ 'to': postId, 'replyTo': null })
          .populate('createdBy', 'username')
          .sort('-createdAt')
          .limit(10)
        SSEConnectionHandler.setConnectionQuery('comment', sseId, sseQuery)
      }
      res.status(200).send(comments)
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
          await Comment.create(newComment)
          await Comment.findOneAndUpdate({ '_id': replyTo }, { $inc: { 'replyCount': 1 } })
          res.status(200).send({ comment: newComment })
        }
      } else {
        let newComment = {
          text: req.body.text,
          to: postId,
          createdBy: req.user._id
        }
        await Comment.create(newComment)
        res.status(201).send({ comment: newComment })
      }
    } catch (err) {
      console.log(err)
      res.status(500).send({
        error: 'An error has occured while posting the comment.'
      })
    }
  },

  async getRepliesOfComment (req, res) {
    let commentId = req.params.commentId
    let replies
    try {
      replies = await Comment
        .find({ 'replyTo': commentId })
        .populate('createdBy', 'username')
        .sort('createdAt')
      res.status(200).send(replies)
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
