const Joi = require('joi')

module.exports = {
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
    const schema = {
      username: Joi.string().min(4).max(15).regex(
        /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/
      ),
      email: Joi.string().email(),
      oldPassword: Joi.string().regex(
        /^[a-zA-Z0-9]{8,32}$/
      ),
      newPassword: Joi.string().regex(
        /^[a-zA-Z0-9]{8,32}$/
      ),
      confirmPassword: Joi.string().regex(
        /^[a-zA-Z0-9]{8,32}$/
      )
    }

    const { error, value } = Joi.validate(req.body, schema) //  eslint-disable-line

    if (!req.params.userId || req.params.userId.length !== 24) {
      res.status(400).send({
        error: 'Invalid user ID.'
      })
    } else if (String(req.user._id) !== req.params.userId) {
      res.status(403).send({
        error: 'You are not authorized for this process.'
      })
    } else if (error) {
      switch (error.details[0].context.key) {
        case 'username':
          res.status(400).send({
            error: 'You must provide a valid username.'
          })
          break
        case 'email':
          res.status(400).send({
            error: 'You must provide a valid email address.'
          })
          break
        case 'password':
          res.status(400).send({
            error: 'You must provide a valid password.'
          })
          break
        default:
          console.log(error.details)
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
  }
}
