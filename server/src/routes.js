const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const PostController = require('./controllers/PostController')
const PostControllerPolicy = require('./policies/PostControllerPolicy')
const IsAuthenticated = require('./policies/IsAuthenticated')
const SSEController = require('./controllers/SSEController')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage
})

module.exports = (app) => {
  app.get('/home',
    IsAuthenticated.check,
    PostController.index)

  app.get('/poststream',
    SSEController.stream)

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login',
    AuthenticationController.login)

  app.post('/upload',
    upload.single('image'),
    IsAuthenticated.restrict,
    PostControllerPolicy.upload,
    PostControllerPolicy.imageValidation,
    PostController.upload)

  app.put('/posts/:postId/upvote',
    IsAuthenticated.restrict,
    PostController.upvote)

  app.put('/posts/:postId/downvote',
    IsAuthenticated.restrict,
    PostController.downvote)

  app.delete('/posts/:postId/upvote',
    IsAuthenticated.restrict,
    PostController.unUpvote)

  app.delete('/posts/:postId/downvote',
    IsAuthenticated.restrict,
    PostController.unDownvote)
}
