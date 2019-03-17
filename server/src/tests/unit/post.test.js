/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const app = require('../../app.js')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
require('sinon-mongoose')
const rewire = require('rewire')
const { mockRequest, mockResponse } = require('mock-req-res')
const expect = chai.expect
const cloudinary = require('cloudinary')
const Post = require('../../models/Post.js')
const User = require('../../models/User.js')
let PostController = require('../../controllers/PostController.js')
let PostControllerPolicy = rewire('../../policies/PostControllerPolicy.js')




describe('Posting content', () => {
  let cloudinaryStub

  before('Cleaning database', async () => {
    cloudinaryStub = sinon.stub(cloudinary.v2.uploader, 'upload').returns({
      url: 'www.testUrl.com'
    })
  })

  after('Cleaning database', async () => {
    cloudinaryStub.restore()
  })

  afterEach(async () => {
    PostControllerPolicy = rewire('../../policies/PostControllerPolicy.js')
  })

  describe('PostControllerPolicy', () => {
    describe('upload', () => {
      it('should not validate post if no title given', async () => {
        let req = mockRequest({
          body: {
            createdBy: '000000000000000000000000'
          }
        })
        let next = sinon.spy()
        let res = mockResponse()
        PostControllerPolicy.upload(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'You must provide a valid title'
        })
      })

      it('should not validate post if invalid creator given', async () => {
        let req = mockRequest({
          body: {
            title: 'testTitle',
            createdBy: '0000'
          }
        })
        let next = sinon.spy()
        let res = mockResponse()
        PostControllerPolicy.upload(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'Invalid author information'
        })
      })

      it('should not validate in case of missing request body', async () => {
        let req = {}
        let res = mockResponse()
        let next = sinon.spy()
        PostControllerPolicy.upload(req, res, next)
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.be.calledWith({
          error: 'No data provided'
        })
      })
    })
    describe('imageValidation', () => {
      it('should not validate image post if file is missing', async () => {
        let req = {}
        let res = mockResponse()
        let next = sinon.spy()
        PostControllerPolicy.imageValidation(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'You must choose a file to upload'
        })
      })

      it('should succesfully validate image with supported type', async () => {
        let req = mockRequest({
          file: {
            buffer: '0000'
          }
        })
        let res = mockResponse()
        PostControllerPolicy.__set__('imageType', sinon.stub().returns({
          ext: 'jpg',
          mime: 'image/jpeg'
        }))
        let next = sinon.spy()
        PostControllerPolicy.imageValidation(req, res, next)
        expect(next).to.have.been.called
      })

      it('should not validate image with unsupported type', async () => {
        let req = mockRequest({
          file: {
            buffer: '000000'
          }
        })
        let res = mockResponse()
        // PostControllerPolicy.__set__('imageType', sinon.stub())
        let next = sinon.spy()
        PostControllerPolicy.imageValidation(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Unsupported type'
        })
        expect(next).to.not.have.been.called
      })

      it('should not validate image with incorrect file content', async () => {
        let req = mockRequest({
          file: {
            buffer: 'FFD80000'
          }
        })
        let res = mockResponse()
        // PostControllerPolicy.__set__('imageType', sinon.stub())
        let next = sinon.spy()
        PostControllerPolicy.imageValidation(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Unsupported type'
        })
        expect(next).to.not.have.been.called
      })

      it('should not validate images bigger than 5MB', async () => {
        let req = mockRequest({
          file: {
            buffer: '0'.repeat(5*1024*1025)
          }
        })
        let res = mockResponse()
        let next = sinon.spy()
        PostControllerPolicy.__set__('imageType', sinon.stub().returns({
          ext: 'jpg',
          mime: 'image/jpeg'
        }))
        PostControllerPolicy.imageValidation(req, res, next)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: "You can't upload files larger than 5MB"
        })
        expect(next).to.not.have.been.called
      })
    })
  })

  describe('PostController', () => {
    describe('index', () => {
      it('should list posts if no query parameters where given', async () => {
        let req = mockRequest()
        let res = mockResponse()
        let queryMock = sinon.mock(Post)
        queryMock.expects('find').chain('exec').resolves('testdata')
        await PostController.index(req, res)
        expect(res.status).to.have.been.calledWith(200)
        expect(res.send).to.have.been.calledWith('testdata')
        queryMock.restore()
      })
    })
  })
})

