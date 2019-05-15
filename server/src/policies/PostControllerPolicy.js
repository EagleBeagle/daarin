const Joi = require('joi')
const imageType = require('image-type')

module.exports = {
  newest (req, res, next) {
    const schema = {
      created: Joi.date(),
      limit: Joi.number().min(5).max(20)
    }
    const { error } = Joi.validate(req.query, schema)
    if (error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  },

  recommendedAndTrending (req, res, next) {
    const schema = {
      oldest: Joi.date(),
      lowest: Joi.number()
    }
    const { error } = Joi.validate(req.query, schema)
    if (error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  },

  search (req, res, next) {
    const schema = {
      query: Joi.string().regex(/^(?!\$).*/).max(100),
      created: Joi.date()
    }
    const { error } = Joi.validate(req.query, schema)
    if (error) {
      res.status(400).send({
        error: 'An error has happened during search.'
      })
    } else {
      next()
    }
  },

  getPost (req, res, next) {
    const schema = {
      postId: Joi.string().alphanum().length(24)
    }
    const { error } = Joi.validate(req.params, schema)
    if (error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  },

  getPostsOfUser (req, res, next) {
    const paramSchema = {
      userId: Joi.string().alphanum().length(24)
    }
    const querySchema = {
      created: Joi.date()
    }
    const paramResult = Joi.validate(req.params, paramSchema)
    const queryResult = Joi.validate(req.query, querySchema)
    if (paramResult.error || queryResult.error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  },

  upload (req, res, next) {
    const schema = {
      title: Joi.string().invalid(['null']).required().regex(/^(?!\$).*/).max(50),
      createdBy: Joi.string().alphanum().length(24),
      tags: Joi.array().items(Joi.string().regex(/^[a-zA-Z0-9_-]*$/).regex(/^(?!\$).*/).max(15)).max(4)
    }
    const { error } = Joi.validate(req.body, schema) //  eslint-disable-line
    if (error) {
      switch (error.details[0].context.key) {
        case 'title':
          res.status(400).send({
            error: 'You must provide a valid title'
          })
          break
        case 'createdBy':
          res.status(400).send({
            error: 'Invalid author information'
          })
          break
        case 'tags':
          res.status(400).send({
            error: 'Bad tag format'
          })
          break
        default:
          console.log(error.details)
          res.status(400).send({
            error: 'Invalid upload information'
          })
      }
    } else if (String(req.user._id) !== String(req.body.createdBy)) {
      res.status(403).send()
    } else if (!req.file) {
      res.status(400).send()
    } else {
      const VALID_IMAGETYPES = ['png', 'jpg', 'jpeg', 'gif']
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
  },

  react (req, res, next) {
    const schema = {
      type: Joi.number().min(0).max(6),
      postId: Joi.string().alphanum().length(24)
    }
    const { error } = Joi.validate(req.params, schema)
    if (error) {
      res.status(400).send()
    } else {
      next()
    }
  }
}
