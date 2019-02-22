/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const app = require('../app.js')
const supertest = require('supertest')
const request = supertest(app)
const expect = chai.expect
const Post = require('../models/Post.js')
const User = require('../models/User.js')
const defaultUser = {
  'email': 'test@test.com',
  'username': 'testUser',
  'password': 'testPassword'
}
let defaultPost = {}

const setDefaultPost = async () => {
  const userId = await User.findOne({ 'email': defaultUser.email }, { '_id': 1 })
  defaultPost = {
    title: 'testImage',
    description: 'test description',
    createdBy: userId._id.toString(),
    content: 'lelelel'
  }
}

describe('Posting content', () => {
  before('Cleaning database', async () => {
    await Post.deleteMany({})
  })

  after('Cleaning database', async () => {
    await Post.deleteMany({})
  })

  describe('Posting an image', () => {
    it('should not upload with no title given', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', '')
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not upload with invalid description', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', 'testDescription'.repeat(100))
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully upload "png" image', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully upload "jpg" image', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_jpg.jpg')
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully upload "jpeg" image', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_jpeg.jpeg')
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully upload "gif" image', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_gif.gif')
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should return error if no image is provided', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not upload image post with incorrect file extension', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/empty_file.asd')
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not upload image post with correct extension, but incorrect file content', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/invalid_image.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not upload images bigger than 5MB', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_big.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })
  })

  describe('Listing posts', () => {
    it('should list all posts in case any exists', async () => {
      return request.get('/home')
        .then((res) => {
          expect(res.statusCode).to.be.equal(200)
          expect(res.body).to.not.be.empty
        })
    })

    it('should have empty response body in case of no posts', async () => {
      await Post.deleteMany({})
      return request.get('/home')
        .then((res) => {
          expect(res.statusCode).to.be.equal(200)
          expect(res.body).to.be.empty
        })
    })
  })
})
