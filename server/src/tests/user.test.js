/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const app = require('../app.js')
const supertest = require('supertest')
const request = supertest(app)
const expect = chai.expect
const User = require('../models/User.js')
const defaultUser = { 'email': 'test@test.com', 'username': 'testUser', 'password': 'testPassword' }

/*  const createUser = async () => {
  const UserModel = new User(defaultUser)
  await UserModel.save()
}

 const getDefaultUser = async () => {
  let users = await User.find({ 'username': defaultUser.username })
  if (users.length === 0) {
    await createUser()
    return getDefaultUser()
  } else {
    return users[0]
  }
}

const cleanExceptDefaultUser = async () => {
  let user = await getDefaultUser()
  await User.deleteMany({ 'username': { $ne: user.username } })
} */

const createDefaultUser = async () => {
  let user = await User.findOne({ 'username': defaultUser.username })
  if (user == null) {
    console.log('anyád')
    const UserModel = new User(defaultUser)
    await UserModel.save()
  }
}

describe('User Authentication', () => {
  let newUser = { 'email': 'newUser@email.com', 'username': 'newUser', 'password': 'newuserPassword' }

  before('Creating default user', done => {
    createDefaultUser()
    done()
  })

  beforeEach(done => {
    newUser = { 'email': 'newUser@email.com', 'username': 'newUser', 'password': 'newuserPassword' }
    done()
  })

  after('Cleaning database', async () => {
    await User.deleteMany({ 'username': { $ne: 'testUser' } })
  })

  describe('Register', () => {
    it('should create user', () => {
      return request.post('/register')
        .send(newUser)
        .then((res) => {
          expect(res.statusCode).to.be.equal(201)
        })
    })

    it('should not create user with existing credentials', async () => {
      return request.post('/register')
        .send(newUser)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
        })
    })

    it('should not create user with invalid email', async () => {
      newUser.email = 'invalidemail.com'
      return request.post('/register')
        .send(newUser)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
        })
    })

    it('should not create user with invalid password', async () => {
      newUser.password = 'short'
      return request.post('/register')
        .send(newUser)
        .then((res) => {
          expect(res.statusCode).to.be.equal(400)
        })
    })
  })

  describe('Login', () => {
    it('should retrieve the token', () => {
      return request.post('/login')
        .send({ 'username': defaultUser.username, 'password': defaultUser.password })
        .then(res => {
          expect(res.statusCode).to.be.equal(200)
          expect(res.body.token).to.exist
          /*  res.status.should.equal(200)
          res.body.success.should.be.true
          res.body.token.should.not.be.empty  */
        })
    })

    it('should not login empty username and password', () => {
      let user = {}
      return request.post('/login')
        .send({ user })
        .then((res) => {
          expect(res.statusCode).to.be.equal(401)
        })
    })

    it('should not login with the right user but wrong password', () => {
      return request.post('/login')
        .send({ 'username': newUser.username, 'password': 'random' })
        .then((res) => {
          expect(res.statusCode).to.be.equal(401)
        })
    })

    it('should return invalid credentials error', () => {
      return request.post('/login')
        .send({ 'username': newUser.username, 'password': '' })
        .then((res) => {
          expect(res.statusCode).to.be.equal(401)
          return request.post('/login')
            .send({ 'username': newUser.username, 'password': 'mypass' })
            .then((res) => {
              expect(res.statusCode).to.be.equal(401)
            })
        })
    })
  })
})
