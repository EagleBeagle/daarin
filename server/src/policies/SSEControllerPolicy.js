const Joi = require('joi')

module.exports = {
  stream (req, res, next) {
    const schema = {
      id: Joi.string()
    }
    const { error } = Joi.validate(req.query, schema)
    if (error) {
      res.status(400).send({
        error: 'Invalid parameters.'
      })
    } else {
      next()
    }
  }
}
