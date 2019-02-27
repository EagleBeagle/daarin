const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Schema.Types.Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [
    { type: Schema.Types.ObjectId, ref: 'Comment' }
  ],
  categories: [
    { type: Schema.Types.ObjectId, ref: 'Post' }
  ],
  comments: [
    { type: Schema.Types.ObjectId, ref: 'Post' }
  ]
})

module.exports = mongoose.model('Post', PostSchema)
