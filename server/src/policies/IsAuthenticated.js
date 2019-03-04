
const passport = require('passport')

module.exports = {
  restrict: function (req, res, next) {
    passport.authenticate('jwt', function (err, user) {
      console.log('ittvagyunk ' + user)
      if (err || !user) {
        res.status(403).send({
          error: 'you do not have access to this resource'
        })
      } else {
        req.user = user
        next()
      }
    })(req, res, next)
  },
  check: function (req, res, next) {
    passport.authenticate('jwt', function (err, user) {
      console.log('ittvagyunk ' + user)
      if (err) {
        res.status(500).send({
          error: 'Error during user authentication'
        })
      } else if (!user) {
        next()
      } else {
        req.user = user
        next()
      }
    })(req, res, next)
  }
}
