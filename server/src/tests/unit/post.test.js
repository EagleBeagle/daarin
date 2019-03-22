/* eslint no-unused-expressions: 0 */
process.env.NODE_ENV = 'test'
const chai = require('chai')
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
const SSEConnectionHandler = require('../../utils/SSEConnectionHandler.js')

describe('Posting content', () => {
  let cloudinaryStub

  before('Creating test doubles', async () => {
    cloudinaryStub = sinon.stub(cloudinary.v2.uploader, 'upload').returns({
      url: 'www.testUrl.com'
    })
  })

  after('Restoring test doubles', async () => {
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
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.be.calledWith({
          error: 'No data provided'
        })
      })

      it('should validate post if post details are correctly given', async () => {
        let req = mockRequest({
          body: {
            title: 'testTitle',
            createdBy: '000000000000000000000000'
          }
        })
        let next = sinon.spy()
        let res = mockResponse()
        PostControllerPolicy.upload(req, res, next)
        expect(next).to.have.been.called
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
            buffer: '0'.repeat(5 * 1024 * 1025)
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
      it('should list posts with no query parameters', async () => {
        let req = mockRequest()
        let res = mockResponse()
        let queryMock = sinon.mock(Post)
        queryMock.expects('find')
          .chain('populate')
          .chain('sort')
          .chain('limit')
          .resolves('ok')
        queryMock.expects('find')
        .chain('sort')
        .chain('limit')
        .resolves('ok')
        await PostController.index(req, res)
        queryMock.restore()
        expect(res.status).to.have.been.calledWith(200)
        expect(res.send).to.have.been.calledWith('ok')
      }),

      it('should set SSE post query to correct value in case of no query parameters', async () => {
        let req = mockRequest({
          user: {
            sseId: 'sse_id'
          }
        })
        let res = mockResponse()
        let queryMock = sinon.mock(Post)
        queryMock.expects('find')
          .chain('populate')
          .chain('sort')
          .chain('limit')
          .resolves('ok')
        queryMock.expects('find').withArgs({}, 'likes dislikes')
        .chain('sort')
        .chain('limit')
        .returns('sse_data')
        let sseHandlerSpy = sinon.spy(SSEConnectionHandler, 'setConnectionQuery')
        await PostController.index(req, res)
        expect(sseHandlerSpy).to.have.been.calledOnceWithExactly('post', req.user.sseId, 'sse_data')
        sseHandlerSpy.restore()
        queryMock.restore()
      }),

      it('should list posts with query parameters', async () => {
        let req = mockRequest({
          query: {
            created: 'date',
            limit: 5
          }
        })
        let res = mockResponse()
        let queryMock = sinon.mock(Post)
        queryMock.expects('find').withArgs({ 'createdAt': { $lt: req.query.created } })
          .chain('populate')
          .chain('sort')
          .chain('limit').withArgs(5)
          .resolves('ok')
        queryMock.expects('find')
        .chain('sort')
        .chain('limit')
        .resolves('ok')
        await PostController.index(req, res)
        queryMock.restore()
        expect(res.status).to.have.been.calledWith(200)
        expect(res.send).to.have.been.calledWith('ok')
      }), 

      it('should set SSE post query to correct value in case of query parameters', async () => {
        let req = mockRequest({
          query: {
            created: 'date',
            limit: 5
          },
          user: {
            sseId: 'sse_id  '
          }
        })
        let res = mockResponse()
        let queryMock = sinon.mock(Post)
        queryMock.expects('find').withArgs({ 'createdAt': { $lt: req.query.created } })
          .chain('populate')
          .chain('sort')
          .chain('limit').withArgs(5)
          .resolves('ok')
        queryMock.expects('find')
        .returns('sse_data')
        let sseHandlerSpy = sinon.spy(SSEConnectionHandler, 'setConnectionQuery')
        await PostController.index(req, res)
        expect(sseHandlerSpy).to.have.been.calledOnceWithExactly('post', req.user.sseId, 'sse_data')
        sseHandlerSpy.restore()
        queryMock.restore()
      })
    }),
    describe('upvote', () => {
      it('should proceed to put upvote to db', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').resolves('ok')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').resolves('ok')
        await PostController.upvote(req, res)
        expect(res.status).to.have.been.calledWith(204)
        expect(postStub).to.have.been.called
        expect(userStub).to.have.been.called
        postStub.restore()
        userStub.restore()
      })
      it('should return error if post id is found to be invalid', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws('CastError')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws('CastError')
        await PostController.upvote(req, res)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Invalid post'
        })
        postStub.restore()
        userStub.restore()
      })
      it('should return error in case of any other kind of error', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws()
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws()
        await PostController.upvote(req, res)
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.have.been.calledWith({
          error: 'An error occured trying to upvote'
        })
        postStub.restore()
        userStub.restore()
      })
    })

    describe('unUpvote', () => {
      it('should proceed to remove upvote from db', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').resolves('ok')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').resolves('ok')
        await PostController.unUpvote(req, res)
        expect(res.status).to.have.been.calledWith(204)
        expect(postStub).to.have.been.called
        expect(userStub).to.have.been.called
        postStub.restore()
        userStub.restore()
      })
      it('should return error if post id is found to be invalid', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws('CastError')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws('CastError')
        await PostController.unUpvote(req, res)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Invalid post'
        })
        postStub.restore()
        userStub.restore()
      })
      it('should return error in case of any other kind of error', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws()
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws()
        await PostController.unUpvote(req, res)
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.have.been.calledWith({
          error: 'An error occured trying to remove the upvote'
        })
        postStub.restore()
        userStub.restore()
      })
    })

    describe('downvote', () => {
      it('should proceed to put downvote to db', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').resolves('ok')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').resolves('ok')
        await PostController.downvote(req, res)
        expect(res.status).to.have.been.calledWith(204)
        expect(postStub).to.have.been.called
        expect(userStub).to.have.been.called
        postStub.restore()
        userStub.restore()
      })
      it('should return error if post id is found to be invalid', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws('CastError')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws('CastError')
        await PostController.downvote(req, res)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Invalid post'
        })
        postStub.restore()
        userStub.restore()
      })
      it('should return error in case of any other kind of error', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws()
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws()
        await PostController.downvote(req, res)
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.have.been.calledWith({
          error: 'An error occured trying to downvote'
        })
        postStub.restore()
        userStub.restore()
      })
    })

    describe('unUpvote', () => {
      it('should proceed to remove downvote from db', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').resolves('ok')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').resolves('ok')
        await PostController.unDownvote(req, res)
        expect(res.status).to.have.been.calledWith(204)
        expect(postStub).to.have.been.called
        expect(userStub).to.have.been.called
        postStub.restore()
        userStub.restore()
      })
      it('should return error if post id is found to be invalid', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws('CastError')
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws('CastError')
        await PostController.unDownvote(req, res)
        expect(res.status).to.have.been.calledWith(400)
        expect(res.send).to.have.been.calledWith({
          error: 'Invalid post'
        })
        postStub.restore()
        userStub.restore()
      })
      it('should return error in case of any other kind of error', async () => {
        let req = mockRequest({
          params: {
            postId: null
          },
          user: {
            id: null
          }
        })
        let res = mockResponse()
        let postStub = await sinon.stub(Post, 'findOneAndUpdate').throws()
        let userStub = await sinon.stub(User, 'findOneAndUpdate').throws()
        await PostController.unDownvote(req, res)
        expect(res.status).to.have.been.calledWith(500)
        expect(res.send).to.have.been.calledWith({
          error: 'An error occured trying to remove the downvote'
        })
        postStub.restore()
        userStub.restore()
      })
    })
  })
})
