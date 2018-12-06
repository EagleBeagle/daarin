const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, required: true },
  likes: { type: Schema.Types.Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  tags: [
    { type: Schema.Types.ObjectId, ref: 'comment' }
  ],
  categories: [
    { type: Schema.Types.ObjectId, ref: 'post' }
  ],
  comments: [
    { type: Schema.Types.ObjectId, ref: 'post' }
  ]
})

module.exports = mongoose.model('Post', PostSchema)
