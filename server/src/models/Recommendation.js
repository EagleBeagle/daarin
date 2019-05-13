const mongoose = require('mongoose')
const Schema = mongoose.Schema
const RecommendationSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  postId2: { type: Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number }
})

module.exports = mongoose.model('Recommendation', RecommendationSchema)
