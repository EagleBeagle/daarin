const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ReactionSchema = new Schema({
  to: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: Number, required: true, min: 0, max: 6 }
})

ReactionSchema.index({ to: 1, user: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('Reaction', ReactionSchema)
