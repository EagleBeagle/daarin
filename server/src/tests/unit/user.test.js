/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
require('sinon-mongoose')
const { mockRequest, mockResponse } = require('mock-req-res')
let AuthenticationController = require('../../controllers/AuthenticationController.js')
let AuthenticationControllerPolicy = require('../../policies/AuthenticationControllerPolicy.js')
const expect = chai.expect
const User = require('../../models/User.js')
const jwt = require('jsonwebtoken')

describe('User Authentication', () => {
  describe('AuthenticationControllerPolicy', () => {
    describe('register', () => {
      it('should not validate registration input with invalid email', async () => {
        let req = mockRequest({
          body: {
            email: 'invalidemail.com',
            password: 'random_password'
          }
        })
        let res = mockResponse()
        let next = sinon.spy()
        AuthenticationControllerPolicy.register(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'You must provide a valid email address'
        })
        expect(next).to.have.not.been.called
      })

      it('should not validate registration input with too short password', async () => {
        let req = mockRequest({
          body: {
            email: 'valid@email.com',
            password: 'short'
          }
        })
        let res = mockResponse()
        let next = sinon.spy()
        AuthenticationControllerPolicy.register(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'The password must be at least 8 characters in length'
        })
        expect(next).to.have.not.been.called
      })
      it('should accept valid registration input', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            email: 'valid@email.com',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let next = sinon.spy()
        AuthenticationControllerPolicy.register(req, res, next)
        expect(next).to.have.been.called
      })
    })
  })

  describe('AuthenticationController', () => {
    describe('register', () => {
      it('should proceed to create new user with correct information', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            email: 'valid@email.com',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let queryMock = sinon.mock(User.prototype)
        queryMock.expects('save').resolves('ok')
        await AuthenticationController.register(req, res)
        expect(res.status).to.have.been.calledWith(201)
        queryMock.verify()
        queryMock.restore()
      })

      it('should not proceed to create new user with existing credentials or other db related issues', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            email: 'valid@email.com',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let queryMock = sinon.mock(User.prototype)
        queryMock.expects('save').throws('MongoError')
        await AuthenticationController.register(req, res)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'This account is already in use.'
        })
        queryMock.verify()
        queryMock.restore()
      })
    })

    describe('login', () => {
      it('should login user with correct information', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let findOneStub = sinon.stub(User, 'findOne').returns(new User({
          username: req.body.username,
          password: req.body.password
        }))
        let comparePasswordStub = sinon.stub(User.prototype, 'comparePassword')
          .callsArgWith(1, null, true)
        let saveStub = sinon.stub(User.prototype, 'save')
        await AuthenticationController.login(req, res)
        findOneStub.restore()
        comparePasswordStub.restore()
        saveStub.restore()
        expect(res.status).to.have.been.calledWith(200)
      })

      it('should not login existing user with wrong password', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let findOneStub = sinon.stub(User, 'findOne').returns(new User({
          username: req.body.username,
          password: req.body.password
        }))
        let comparePasswordStub = sinon.stub(User.prototype, 'comparePassword')
          .callsArgWith(1, null, false)
        let saveStub = sinon.stub(User.prototype, 'save')
        await AuthenticationController.login(req, res)
        findOneStub.restore()
        comparePasswordStub.restore()
        saveStub.restore()
        expect(res.status).to.have.been.calledWith(401)
      })

      it('should not login non-existent user', async () => {
        let req = mockRequest()
        let res = mockResponse()
        let findOneStub = sinon.stub(User, 'findOne').returns(null)
        await AuthenticationController.login(req, res)
        findOneStub.restore()
        expect(res.status).to.have.been.calledWith(401)
        expect(res.send).to.have.been.calledWith({
          error: 'The login information was incorrect'
        })
      })

      it('should sign jwt if login is succesful', async () => {
        let req = mockRequest({
          body: {
            username: 'valid_username',
            password: 'validpassword'
          }
        })
        let res = mockResponse()
        let findOneStub = sinon.stub(User, 'findOne').returns(new User({
          username: req.body.username,
          password: req.body.password
        }))
        let comparePasswordStub = sinon.stub(User.prototype, 'comparePassword')
          .callsArgWith(1, null, true)
        let saveStub = sinon.stub(User.prototype, 'save')
        let jwtSpy = sinon.spy(jwt, 'sign')
        await AuthenticationController.login(req, res)
        findOneStub.restore()
        comparePasswordStub.restore()
        saveStub.restore()
        expect(res.status).to.have.been.calledWith(200)
        expect(jwtSpy.calledOnce).to.be.true
        jwtSpy.restore()
      })

      it('should respond with error in case of issues with fetching from db', async () => {
        let req = mockRequest()
        let res = mockResponse()
        sinon.stub(console, 'log')
        let findOneStub = sinon.stub(User, 'findOne').throws()
        await AuthenticationController.login(req, res)
        findOneStub.restore()
        console.log.restore()
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.have.been.calledWith({
          error: 'An error has occured trying to log in'
        })
      })
    })
  })
})
