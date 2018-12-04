const User = require('../models/User.js')

module.exports = {
  async register (req, res) {
    try {
      console.log(req.body)
      req.body.admin = false
      const user = await User.create(req.body)
      res.send(user.toJSON())
    } catch (err) {
      res.status(400).send({
        error: 'This account is already in use.'
      })
    }
  }
}
