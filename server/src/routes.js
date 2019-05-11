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
    IsAuthenticated.attachUser,
    PostController.index)

  app.get('/stream',
    SSEController.stream)

  app.get('/posts/:postId',
    IsAuthenticated.attachUser,
    PostController.getPost)

  app.get('/admin/posts',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    PostController.getPostsAdmin)

  app.get('/search',
    IsAuthenticated.attachUser,
    PostController.search)

  app.get('/posts/user/:userId',
    IsAuthenticated.attachUser,
    PostController.getPostsOfUser)

  app.get('/posts/reacted/user/:userId',
    IsAuthenticated.attachUser,
    PostController.getReactedPostsOfUser)

  app.get('/posts/commented/user/:userId',
    IsAuthenticated.attachUser,
    PostController.getCommentedPostsOfUser)

  app.get('/posts/:postId/comments',
    IsAuthenticated.attachUser,
    CommentController.getCommentsOfPost)

  app.get('/posts/:postId/comments/:commentId/replies',
    IsAuthenticated.attachUser,
    CommentController.getRepliesOfComment)

  app.post('/posts/:postId/comments',
    IsAuthenticated.restrict,
    CommentController.createComment)

  app.put('/comments/:commentId/report',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentController.report)

  app.delete('/comments/:commentId',
    IsAuthenticated.restrict,
    CommentController.delete)

  app.get('/admin/comments',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    CommentController.getCommentsAdmin)

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login',
    AuthenticationController.login)

  app.post('/verify',
    AuthenticationController.verify)

  app.get('/users/:userId',
    IsAuthenticated.attachUser,
    UserController.getUser)

  app.put('/users/:userId/admin',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserController.setAsAdmin)

  app.delete('/users/:userId/admin',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserController.unsetAdmin)

  app.delete('/users/:userId',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserController.deleteUser)

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

  app.get('/admin/users',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserController.getUsersAdmin)

  app.post('/upload',
    upload.single('image'),
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostControllerPolicy.upload,
    PostControllerPolicy.imageValidation,
    PostController.upload)

  app.delete('/posts/:postId',
    IsAuthenticated.restrict,
    PostController.delete)

  app.put('/posts/:postId/report',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostController.report)

  app.put('/posts/:postId/reaction/:type',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostController.react)

  app.delete('/posts/:postId/reaction/:type',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostController.unReact)

  app.put('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentController.upvote)

  app.put('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentController.downvote)

  app.delete('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentController.unUpvote)

  app.delete('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentController.unDownvote)
}
