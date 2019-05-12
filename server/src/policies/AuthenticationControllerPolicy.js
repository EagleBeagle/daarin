const Joi = require('joi')

module.exports = {
  register (req, res, next) {
    const schema = {
      username: Joi.string().min(4).max(15).regex(
        /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/
      ),
      email: Joi.string().email(),
      password: Joi.string().regex(/^(?!\$).*/).min(8).max(32)
    }

    const { error, value } = Joi.validate(req.body, schema) //  eslint-disable-line

    if (error) {
      switch (error.details[0].context.key) {
        case 'username':
          res.status(400).send({
            error: 'You must provide a valid username'
          })
          break
        case 'email':
          res.status(400).send({
            error: 'You must provide a valid email address'
          })
          break
        case 'password':
          res.status(400).send({
            error: `The password must be at least 8 characters in length`
          })
          break
        default:
          console.log(error.details)
          res.status(400).send({
            error: 'Invalid registration information'
          })
      }
    } else {
      next()
    }
  },

  login (req, res, next) {
    const schema = {
      username: Joi.string().max(15),
      password: Joi.string().max(32)
    }
    const { error } = Joi.validate(req.body, schema)
    if (error) {
      res.status(400).send()
    } else {
      next()
    }
  },

  forgotPassword (req, res, next) {
    const schema = {
      email: Joi.string().email()
    }
    const { error } = Joi.validate(req.body, schema)
    if (error) {
      res.status(400).send({
        error: 'Invalid email provided.'
      })
    } else {
      next()
    }
  },

  resetPassword (req, res, next) {
    const querySchema = {
      id: Joi.string().max(200)
    }
    const bodySchema = {
      password: Joi.string().regex(/^(?!\$).*/).min(8).max(32)
    }
    const queryResult = Joi.validate(req.query, querySchema)
    const bodyResult = Joi.validate(req.body, bodySchema)
    if (queryResult.error) {
      res.status(400).send({
        error: 'Invalid or no ID.'
      })
    } else if (bodyResult.error) {
      res.status(400).send({
        error: 'Invalid password.'
      })
    } else {
      next()
    }
  }
}
