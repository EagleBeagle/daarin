const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const PostController = require('./controllers/PostController')
const PostControllerPolicy = require('./policies/PostControllerPolicy')
const CommentController = require('./controllers/CommentController')
const CommentControllerPolicy = require('./policies/CommentControllerPolicy')
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
  app.get('/newest',
    IsAuthenticated.attachUser,
    PostControllerPolicy.newest,
    PostController.newest)

  app.get('/recommended',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostControllerPolicy.recommendedAndTrending,
    PostController.recommended)

  app.get('/trending',
    IsAuthenticated.attachUser,
    PostControllerPolicy.recommendedAndTrending,
    PostController.trending)

  app.get('/stream',
    SSEController.stream)

  app.get('/posts/:postId',
    IsAuthenticated.attachUser,
    PostControllerPolicy.getPost,
    PostController.getPost)

  app.get('/admin/posts',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    PostController.getPostsAdmin)

  app.get('/search',
    IsAuthenticated.attachUser,
    PostControllerPolicy.search,
    PostController.search)

  app.get('/posts/:postId/similar',
    PostController.getSimilarPosts)

  app.get('/posts/user/:userId',
    IsAuthenticated.attachUser,
    PostControllerPolicy.getPostsOfUser,
    PostController.getPostsOfUser)

  app.get('/posts/reacted/user/:userId',
    IsAuthenticated.attachUser,
    PostControllerPolicy.getPostsOfUser,
    PostController.getReactedPostsOfUser)

  app.get('/posts/commented/user/:userId',
    IsAuthenticated.attachUser,
    PostControllerPolicy.getPostsOfUser,
    PostController.getCommentedPostsOfUser)

  app.get('/posts/:postId/comments',
    IsAuthenticated.attachUser,
    CommentControllerPolicy.getCommentsOfPost,
    CommentController.getCommentsOfPost)

  app.get('/posts/:postId/comments/:commentId/replies',
    IsAuthenticated.attachUser,
    CommentControllerPolicy.getRepliesOfComment,
    CommentController.getRepliesOfComment)

  app.post('/posts/:postId/comments',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.createComment,
    CommentController.createComment)

  app.put('/comments/:commentId/report',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.reportAndDelete,
    CommentController.report)

  app.delete('/comments/:commentId',
    IsAuthenticated.restrict,
    CommentControllerPolicy.reportAndDelete,
    CommentController.delete)

  app.get('/admin/comments',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    CommentController.getCommentsAdmin)

  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login',
    AuthenticationControllerPolicy.login,
    AuthenticationController.login)

  app.post('/verify',
    AuthenticationController.verify)

  app.post('/forgotpassword',
    AuthenticationController.forgotPassword,
    AuthenticationController.forgotPassword)

  app.post('/resetpassword',
    AuthenticationController.resetPassword)

  app.get('/users/:userId',
    IsAuthenticated.attachUser,
    UserControllerPolicy.validateUserId,
    UserController.getUser)

  app.put('/users/:userId/admin',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserControllerPolicy.validateUserId,
    UserController.setAsAdmin)

  app.delete('/users/:userId/admin',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserControllerPolicy.validateUserId,
    UserController.unsetAdmin)

  app.delete('/users/:userId',
    IsAuthenticated.restrict,
    IsAuthenticated.admin,
    UserControllerPolicy.validateUserId,
    UserController.deleteUser)

  app.get('/users/:userId/settings',
    IsAuthenticated.restrict,
    UserControllerPolicy.getUserSettings,
    UserController.getUserSettings)

  app.put('/users/:userId/avatar',
    upload.single('image'),
    IsAuthenticated.restrict,
    UserControllerPolicy.changeAvatar,
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
    PostControllerPolicy.react,
    PostController.react)

  app.delete('/posts/:postId/reaction/:type',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    PostControllerPolicy.react,
    PostController.unReact)

  app.put('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.vote,
    CommentController.upvote)

  app.put('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.vote,
    CommentController.downvote)

  app.delete('/posts/:postId/comments/:commentId/upvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.vote,
    CommentController.unUpvote)

  app.delete('/posts/:postId/comments/:commentId/downvote',
    IsAuthenticated.restrict,
    IsAuthenticated.restrictUnverified,
    CommentControllerPolicy.vote,
    CommentController.unDownvote)
}
