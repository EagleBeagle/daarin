const Joi = require('joi')
//  const readChunk = require('read-chunk')
const imageType = require('image-type')

module.exports = {
  upload (req, res, next) { //  TODO: CreatedBy (authenticatio)
    console.log('UPLOADKOKUKUKUKUUKUKUI: ' + req.session.username)
    const schema = {
      title: Joi.string().invalid(['null']).required().max(250),
      createdBy: Joi.string(),
      image: Joi.binary()
    }

    const { error, value } = Joi.validate(req.body, schema) //  eslint-disable-line

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
        default:
          console.log(error.details)
          res.status(400).send({
            error: 'Invalid upload information'
          })
      }
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
