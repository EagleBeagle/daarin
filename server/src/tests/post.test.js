/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const http = require('chai-http')
const app = require('../app.js')
chai.use(http)
const expect = chai.expect
const Post = require('../models/Post.js')
//  const defaultUser = { 'email': 'test@test.com', 'username': 'testUser', 'password': 'testPassword' }

describe('Posting content', () => {
  before('Cleaning database', async () => {
    await Post.deleteMany({})
  })

  describe('Listing posts', () => {
    it('should have empty response body in case of no posts', () => {
      return chai.request(app).get('/home')
        .then((res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.empty
        })
    })
  })
})
