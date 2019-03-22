/* eslint-disable no-unused-expressions */
process.env.NODE_ENV = 'test'
const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const expect = chai.expect
require('sinon-mongoose')
const { mockRequest, mockResponse } = require('mock-req-res')
const SSEController = require('../../controllers/SSEController.js')
const SSEConnectionHandler = require('../../utils/SSEConnectionHandler.js')
// const common = require('../../utils/common.js')
// const Post = require('../../models/Post.js')

describe('Server-sent event handling', () => {
  let req, res, clock

  beforeEach('Creating test doubles', () => {
    req = mockRequest({
      on: sinon.stub()
    })
    res = mockResponse({
      sseSetup: sinon.stub(),
      sseSend: sinon.stub()
    })
    clock = sinon.useFakeTimers()
  })

  afterEach('Clearing test doubles', () => {
    clock.restore()
  })

  describe('SSEController', () => {
    describe('stream', () => {
      it('should add the new connection to the list of connections', async () => {
        let createConnectionSpy = sinon.spy(SSEConnectionHandler, 'createNewConnection')
        await SSEController.stream(req, res)
        expect(createConnectionSpy).to.have.been.calledOnce
        createConnectionSpy.restore()
      })

      it('should send data over sse in correct intervals', async () => {
        await SSEController.stream(req, res)
        clock.tick(6000)
        expect(res.sseSend).to.have.been.calledThrice
      })

      it('should send data over a single event if query is provided for it', async () => {
        req.query = {
          id: 'sse_id'
        }
        let query = {
          exec: sinon.stub().resolves('ok')
        }
        await SSEController.stream(req, res)
        SSEConnectionHandler.setConnectionQuery('post', req.query.id, query)
        clock.tick(2000)
        expect(query.exec).to.have.been.calledOnce
      })
    })
  })
})
