const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  avatar: String,
  rank: String,
  ownPosts: [
    { type: Schema.Types.ObjectId, ref: 'post' }
  ],
  likedPosts: [
    { type: Schema.Types.ObjectId, ref: 'post' }
  ],
  likedComments: [
    { type: Schema.Types.ObjectId, ref: 'comment' }
  ]
})

module.exports = mongoose.model('User', UserSchema)
