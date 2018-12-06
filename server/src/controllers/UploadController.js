const Post = require('../models/Post.js')

module.exports = {
  upload (req, res) {
    const encoded = req.file.buffer.toString('base64')
    let newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      content: encoded
    })

    newPost.save(function (err) {
      if (err) {
        res.status(500).send({
          error: 'An error occured during the upload.'
        })
      }
      res.json({ post: newPost })
    })
  }
}
