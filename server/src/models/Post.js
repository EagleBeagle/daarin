const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, unique: true, required: true },
  createdAt: { type: String, required: true },
  likes: { type: Boolean, default: false },
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
