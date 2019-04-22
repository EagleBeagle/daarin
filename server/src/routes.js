const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const PostController = require('./controllers/PostController')
const PostControllerPolicy = require('./policies/PostControllerPolicy')
const CommentController = require('./controllers/CommentController')
const IsAuthenticated = require('./policies/IsAuthenticated')
const SSEController = require('./controllers/SSEController')
const UserController = require('./controllers/UserController')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage
})

module.exports = (app) => {
  app.get('/home',
    IsAuthenticated.check,
    PostController.index)

  app.get('/stream',
    SSEController.stream)

  app.get('/posts/:postId',
    PostController.getPost)

  app.get('/posts/:postId/comments',
    IsAuthenticated.check,
    CommentController.getCommentsOfPost)

  app.get('/posts/:postId/comments/:commentId/replies',
    IsAuthenticated.check,
    CommentController.getRepliesOfComment)

  app.post('/posts/:postId/comments',
    IsAuthenticated.restrict,
    CommentController.createComment)

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login',
    AuthenticationController.login)

  app.get('/users/:userId',
    UserController.getUser)

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

  app.put('/posts/:postId/reaction/:type',
    IsAuthenticated.restrict,
    PostController.react)

  app.delete('/posts/:postId/reaction/:type',
    IsAuthenticated.restrict,
    PostController.unReact)

  app.put('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    CommentController.upvote)

  app.put('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    CommentController.downvote)

  app.delete('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    CommentController.unUpvote)

  app.delete('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    CommentController.unDownvote)
}
