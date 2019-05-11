const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CommentSchema = new Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  to: { type: Schema.Types.ObjectId, ref: 'Post' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Comment' },
  replyCount: { type: Number, default: 0 },
  reports: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ],
  likes: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ],
  dislikes: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ]
})

module.exports = mongoose.model('Comment', CommentSchema)
