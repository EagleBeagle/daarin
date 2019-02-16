/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const http = require('chai-http')
const app = require('../app.js')
chai.use(http)
const expect = chai.expect
const User = require('../models/User.js')
const defaultUser = { 'email': 'test@test.com', 'username': 'testUser', 'password': 'testPassword' }

const createUser = async () => {
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
}

describe('# Authentication', () => {
  const newUser = { 'email': 'newUser@email.com', 'username': 'newUser', 'password': 'newuserPassword' }
  it('should create user', () => {
    return cleanExceptDefaultUser().then(() => {
      return chai.request(app).post('/register')
        .send(newUser)
        .then((res) => {
          expect(res).to.have.status(201)
        })
    })
  })

  it('should not create user with existing credentials', () => {
    return cleanExceptDefaultUser().then(async () => {
      await new User(newUser).save()
      return chai.request(app).post('/register')
        .send(newUser)
        .then((res) => {
          expect(res).to.have.status(400)
        })
    })
  })

  it('should retrieve the token', () => {
    return cleanExceptDefaultUser().then(res => {
      return chai.request(app).post('/login')
        .send({ 'username': defaultUser.username, 'password': defaultUser.password })
        .then(res => {
          expect(res).to.have.status(200)
          expect(res.body.token).to.exist
          /*  res.status.should.equal(200)
          res.body.success.should.be.true
          res.body.token.should.not.be.empty  */
        })
    })
  })

  it('should not login with the right user but wrong password', () => {
    return chai.request(app).post('/login')
      .send({ 'username': newUser.username, 'password': 'random' })
      .then((res) => {
        expect(res).to.have.status(401)
      })
  })

  it('should return invalid credentials error', () => {
    return chai.request(app).post('/login')
      .send({ 'username': newUser.username, 'password': '' })
      .then((res) => {
        expect(res).to.have.status(401)
        return chai.request(app).post('/login')
          .send({ 'username': newUser.username, 'password': 'mypass' })
          .then((res) => {
            expect(res).to.have.status(401)
          })
      })
  })
})
