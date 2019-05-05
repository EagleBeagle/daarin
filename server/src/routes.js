const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const PostController = require('./controllers/PostController')
const PostControllerPolicy = require('./policies/PostControllerPolicy')
const CommentController = require('./controllers/CommentController')
const IsAuthenticated = require('./policies/IsAuthenticated')
const SSEController = require('./controllers/SSEController')
const UserController = require('./controllers/UserController')
const UserControllerPolicy = require('./policies/UserControllerPolicy')
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
    IsAuthenticated.check,
    PostController.getPost)

  app.get('/posts/user/:userId',
    IsAuthenticated.check,
    PostController.getPostsOfUser)

  app.get('/posts/reacted/user/:userId',
    IsAuthenticated.check,
    PostController.getReactedPostsOfUser)

  app.get('/posts/commented/user/:userId',
    IsAuthenticated.check,
    PostController.getCommentedPostsOfUser)

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

  app.post('/verify',
    AuthenticationController.verify)

  app.get('/users/:userId',
    IsAuthenticated.check,
    UserController.getUser)

  app.get('/users/:userId/settings', // TODO tiltani más usereket
    IsAuthenticated.restrict,
    UserControllerPolicy.getUserSettings,
    UserController.getUserSettings)

  app.put('/users/:userId/avatar',
    upload.single('image'),
    IsAuthenticated.restrict,
    UserController.changeAvatar)

  app.put('/users/:userId/settings',
    IsAuthenticated.restrict,
    UserControllerPolicy.changeUserSettings,
    UserController.changeUserSettings)

  app.post('/upload',
    upload.single('image'),
    IsAuthenticated.restrict,
    PostControllerPolicy.upload,
    PostControllerPolicy.imageValidation,
    PostController.upload)

  app.delete('/posts/:postId',
    IsAuthenticated.restrict,
    PostController.delete)

  app.put('/posts/:postId/report',
    IsAuthenticated.restrict,
    PostController.report)

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
