const Joi = require('joi')

module.exports = {
  getCommentsOfPost (req, res, next) {
    const paramSchema = {
      postId: Joi.string().alphanum().length(24).required()
    }
    const querySchema = {
      newest: Joi.date(),
      oldest: Joi.date(),
      highest: Joi.date(),
      lowest: Joi.date(),
      sortBy: Joi.string().valid('date', 'relevancy')
    }
    const paramResult = Joi.validate(req.params, paramSchema) //  eslint-disable-line
    const queryResult = Joi.validate(req.query, querySchema) //  eslint-disable-line

    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else if (queryResult.error) {
      res.status(400).send({
        error: 'Invalid query parameters.'
      })
    } else {
      next()
    }
  },

  createComment (req, res, next) {
    const paramSchema = {
      postId: Joi.string().alphanum().length(24).required()
    }
    const bodySchema = {
      text: Joi.string().regex(/^(?!\$).*/).max(250).required(),
      replyTo: Joi.string().alphanum().length(24)
    }
    const paramResult = Joi.validate(req.params, paramSchema)
    const bodyResult = Joi.validate(req.body, bodySchema)
    console.log(req.body.text)
    console.log(paramResult.error)
    console.log(bodyResult.error)
    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else if (bodyResult.error) {
      switch (bodyResult.error.details[0].context.key) {
        case 'text':
          res.status(400).send({
            error: 'Wrong comment format.'
          })
          break
        case 'replyTo':
          res.status(400).send()
          break
        default:
          res.status(400).send()
      }
    } else {
      next()
    }
  },

  getRepliesOfComment (req, res, next) {
    const paramSchema = {
      postId: Joi.string().alphanum().length(24).required(),
      commentId: Joi.string().alphanum().length(24).required()
    }
    const querySchema = {
      newest: Joi.date()
    }
    const paramResult = Joi.validate(req.params, paramSchema)
    const queryResult = Joi.validate(req.query, querySchema)
    console.log(paramResult.error)
    console.log(queryResult.error)
    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else if (queryResult.error) {
      res.status(400).send({
        error: 'Invalid date'
      })
    } else {
      next()
    }
  },

  vote (req, res, next) {
    const paramSchema = {
      postId: Joi.string().alphanum().length(24).required(),
      commentId: Joi.string().alphanum().length(24).required()
    }
    const paramResult = Joi.validate(req.params, paramSchema)
    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  },

  reportAndDelete (req, res, next) {
    const paramSchema = {
      commentId: Joi.string().alphanum().length(24).required()
    }
    const paramResult = Joi.validate(req.params, paramSchema)
    if (paramResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  }
}
