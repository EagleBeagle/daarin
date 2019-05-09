const Joi = require('joi')
//  const readChunk = require('read-chunk')
const imageType = require('image-type')

module.exports = {
  upload (req, res, next) {
    const schema = {
      title: Joi.string().invalid(['null']).required().max(50),
      createdBy: Joi.string().alphanum().length(24),
      tags: Joi.array().items(Joi.string().regex(/^[a-zA-Z0-9_-]*$/)).max(4)
    }
    const { error, value } = Joi.validate(req.body, schema) //  eslint-disable-line
    if (!req.body) {
      res.status(400).send({
        error: 'No data provided'
      })
    } else if (error) {
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
    } else {
      next()
    }
  },

  imageValidation (req, res, next) {
    if (!req.file) {
      res.status(400).send({
        error: 'You must choose a file to upload'
      })
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
  }
}
