const User = require('../models/User.js')

module.exports = {
  async getUser (req, res) {
    let userId = req.params.userId
    try {
      let user = await User.findById(userId)
      res.status(200).send(user)
    } catch (err) {
      res.status(500).send({
        error: 'An error has occured while fetching the user.'
      })
    }
  }
}
