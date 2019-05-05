const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reports: { type: Schema.Types.ObjectId, ref: 'User' },
  tags: [
    { type: String }
  ],
  categories: [
    { type: Schema.Types.ObjectId, ref: 'Post' }
  ]
})

module.exports = mongoose.model('Post', PostSchema)
