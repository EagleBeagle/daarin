const Joi = require('joi')
const imageType = require('image-type')

module.exports = {
  validateUserId (req, res, next) {
    const schema = {
      userId: Joi.string().alphanum().length(24)
    }
    const { error } = Joi.validate(req.params, schema)
    if (error) {
      res.status(400).send()
    } else {
      next()
    }
  },

  getUserSettings (req, res, next) {
    if (!req.params.userId || req.params.userId.length !== 24) {
      res.status(400).send({
        error: 'Invalid user ID.'
      })
    } else if (String(req.user._id) !== req.params.userId) {
      res.status(403).send({
        error: 'You are not authorized for this process.'
      })
    } else {
      next()
    }
  },

  changeUserSettings (req, res, next) {
    const bodySchema = {
      username: Joi.string().regex(
        /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/
      ).min(4).max(15),
      oldPassword: Joi.string().regex(/^(?!\$).*/),
      newPassword: Joi.string().regex(/^(?!\$).*/).min(8).max(32),
      confirmPassword: Joi.string().regex(/^(?!\$).*/).min(8).max(32)
    }
    const paramSchema = {
      userId: Joi.string().alphanum().length(24)
    }

    const bodyResult = Joi.validate(req.body, bodySchema)
    const paramResult = Joi.validate(req.params, paramSchema)

    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else if (String(req.user._id) !== req.params.userId) {
      res.status(403).send({
        error: 'You are not authorized for this process.'
      })
    } else if (bodyResult.error) {
      switch (bodyResult.error.details[0].context.key) {
        case 'username':
          res.status(400).send({
            error: 'You must provide a valid username.'
          })
          break
        case 'password':
          res.status(400).send({
            error: 'You must provide a valid password.'
          })
          break
        default:
          console.log(bodyResult.error.details)
          res.status(400).send({
            error: 'Invalid information'
          })
      }
    } else if (req.body.newPassword || req.body.oldPassword || req.body.confirmPassword) {
      if (req.body.newPassword && req.body.oldPassword && req.body.confirmPassword) {
        if (req.body.newPassword === req.body.confirmPassword) {
          next()
        } else {
          res.status(400).send({
            error: "The new password fields don't match."
          })
        }
      } else {
        res.status(400).send({
          error: 'You have to fill all password fields if you wish to change your password.'
        })
      }
    } else {
      next()
    }
  },

  changeAvatar (req, res, next) {
    if (!req.file) {
      res.status(400).send()
    } else {
      const VALID_IMAGETYPES = ['png', 'jpg', 'jpeg']
      const SIZE_LIMIT = 5 * 1024 * 1024
      const buffer = req.file.buffer
      const fileType = imageType(buffer)
      if (!fileType || !VALID_IMAGETYPES.includes(fileType.ext)) {
        res.status(400).send({
          error: 'Unsupported type'
        })
      } else if (buffer.length > SIZE_LIMIT) {
        res.status(400).send({
          error: "You can't upload files larger than 5MB"
        })
      } else {
        next()
      }
    }
  }
}
