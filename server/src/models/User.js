const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema({
  email: String,
  username: String,
  password: String,
  admin: Boolean,
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
