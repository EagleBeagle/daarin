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
let token

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
  })

  describe('Posting an image', () => {
    it('should not upload with no title given', async () => {
      await setDefaultPost()
      return request.post('/upload')
        .field('title', '')
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .set('Authorization', 'Bearer ' + token)
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
        .field('description', 'testDescription'.repeat(100))
        .field('createdBy', defaultPost.createdBy)
        .attach('image', 'src/tests/assets/test_png.png')
        .then((res) => {
          expect(res.statusCode).to.be.equal(403)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .field('description', defaultPost.description)
        .field('createdBy', defaultPost.createdBy)
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
        .set('Authorization', 'Bearer ' + token)
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
