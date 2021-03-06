const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const Schema = mongoose.Schema
const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  admin: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },
  avatar: String,
  reportCount: { type: Number, default: 0 },
  reactionCount: { type: Number, default: 0 },
  confirmationId: { type: String },
  sseId: { type: String },
  resetPasswordId: { type: String }
})

UserSchema.pre('save', function (next) {
  var user = this
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err)
      }
      bcrypt.hash(user.password, salt, null, function (err, hash) {
        if (err) {
          return next(err)
        }
        user.password = hash
        next()
      })
    })
  } else {
    return next()
  }
})

UserSchema.methods.comparePassword = function (password, next) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) {
      return next(err)
    }
    next(null, isMatch)
  })
}

module.exports = mongoose.model('User', UserSchema)
