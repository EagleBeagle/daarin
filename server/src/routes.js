const AuthenticationController = require('./controllers/AuthenticationController')
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const UploadController = require('./controllers/UploadController')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage
})

module.exports = (app) => {
  app.post('/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

  app.post('/login',
    AuthenticationController.login)

  app.post('/upload', upload.single('image'),
    UploadController.upload)
}
