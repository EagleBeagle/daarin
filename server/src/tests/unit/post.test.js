/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const app = require('../../app.js')
const supertest = require('supertest')
const request = supertest(app)
const sinon = require('sinon')
const expect = chai.expect
const cloudinary = require('cloudinary')
const Post = require('../../models/Post.js')
const User = require('../../models/User.js')
const defaultUser = {
  'email': 'test@test.com',
  'username': 'testUser',
  'password': 'testPassword',
  'sseId': '00000'
}
let defaultPost = {}
let token = null

const setDefaultPost = async () => {
  const userId = await User.findOne({ 'email': defaultUser.email }, { '_id': 1 })
  defaultPost = {
    title: 'testImage',
    createdBy: userId._id.toString(),
    url: 'www.testUrl.com'
  }
}

describe('Posting content', () => {
  let cloudinaryStub

  before('Cleaning database', async () => {
    await Post.deleteMany({})
    cloudinaryStub = sinon.stub(cloudinary.v2.uploader, 'upload').returns({
      url: 'www.testUrl.com'
    })
    return request.post('/login')
      .send({
        username: defaultUser.username,
        password: defaultUser.password
      })
      .then((res) => {
        token = res.body.token
      })
  })

  after('Cleaning database', async () => {
    await Post.deleteMany({})
    cloudinaryStub.restore()
  })

  describe('Posting an image', () => {
    it('should not validate image if no title given', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', '')
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not allow unauthorized upload', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(403)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully validate "png" image for upload', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully validate "jpg" image for upload', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_jpg.jpg')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully validate "jpeg" image for upload', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_jpeg.jpeg')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should succesfully validate "gif" image for upload', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_gif.gif')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should return error if no image is provided', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
        })
    })

    it('should not validate image post with incorrect file extension', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/empty_file.asd')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not validate image post with correct extension, but incorrect file content', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/invalid_image.png')
        .set('Authorization', 'Bearer ' + token)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
          //  expect(res.body).to.be.not.empty
        })
    })

    it('should not validate images bigger than 5MB', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', defaultPost.title)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_big.png')
        .set('Authorization', 'Bearer ' + token)
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

    it('should set SSE query to', async () => {
      return request.get('/home')
        .set('Authorization', 'Bearer ' + token)
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
