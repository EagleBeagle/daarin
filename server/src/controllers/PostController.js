const Post = require('../models/Post.js')
//  const User = require('../models/User.js')

module.exports = {
  async index (req, res) {
    let posts = null
    try {
      posts = await Post.find().populate('createdBy', 'username').sort('-createdAt')
      for (let key in posts) {
        posts[key].populate('createdBy')
      }
      res.send(posts)
    } catch (err) {
      res.status(500).send({
        error: 'an error has occured trying to fetch the posts'
      })
    }
  },
  upload (req, res) {
    const encoded = req.file.buffer.toString('base64')
    let newPost = new Post({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.body.createdBy,
      content: 'data:image/png;base64, ' + encoded
    })

    newPost.save(function (err) {
      if (err) {
        res.status(500).send({
          error: 'An error occured during the upload.'
        })
      }
      res.status(201).json({ post: newPost })
    })
  }
}
