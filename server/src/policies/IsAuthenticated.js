
const passport = require('passport')

module.exports = {
  restrict: function (req, res, next) {
    passport.authenticate('jwt', function (err, user) {
      if (err || !user) {
        res.status(403).send({
          error: 'You do not have access to this action.'
        })
      } else {
        req.user = user
        next()
      }
    })(req, res, next)
  },
  restrictUnverified: function (req, res, next) {
    if (!req.user.confirmed) {
      res.status(403).send({
        error: 'Confirm your email address to access this action.'
      })
    } else {
      next()
    }
  },
  attachUser: function (req, res, next) {
    passport.authenticate('jwt', function (err, user) {
      if (err) {
        res.status(500).send({
          error: 'Error during user authentication.'
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
