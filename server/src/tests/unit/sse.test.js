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
let SSEConnectionHandler = require('../../utils/SSEConnectionHandler.js')

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
        req.query = {
          id: 'test_id'
        }
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

      it('should stream to error event if something goes wrong', async () => {
        req.query = {
          id: 'sse_id'
        }
        let query = {
          exec: sinon.stub().throws()
        }
        await SSEController.stream(req, res)
        SSEConnectionHandler.setConnectionQuery('post', req.query.id, query)
        clock.tick(2000)
        expect(res.sseSend).to.have.been.calledWith('error')
      })
    })
  })

  describe('SSEConnectionHandler', () => {
    describe('createNewConnection', () => {
      it('should create connection object and add it to existing connections', () => {
        let sseId = 'test_id'
        SSEConnectionHandler.createNewConnection(sseId)
        expect(SSEConnectionHandler.connections[sseId]).to.exist
      })

      it('should create connection object with correct properties', () => {
        let sseId = null
        SSEConnectionHandler.createNewConnection(sseId)
        expect(SSEConnectionHandler.connections[sseId].postQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].userQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].popupQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].errorData).to.be.null
      })
    })

    describe('setConnectionQuery', () => {
      it('should do nothing if incorrect type is given', () => {
        let type = 'not_valid_type'
        let sseId = 'test_id'
        let query = 'test_query'
        SSEConnectionHandler.setConnectionQuery(type, sseId, query)
        expect(SSEConnectionHandler.connections[sseId].postQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].userQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].popupQuery).to.be.null
        expect(SSEConnectionHandler.connections[sseId].errorData).to.be.null
      })

      it('should set the given query type of the object', () => {
        let type = 'post'
        let sseId = 'test_id'
        let query = 'test_query'
        SSEConnectionHandler.setConnectionQuery(type, sseId, query)
        expect(SSEConnectionHandler.connections[sseId].postQuery).to.equal(query)
      })
    })

    describe('deleteConnection', () => {
      it('should delete the given connection', () => {
        let sseId = 'test_id'
        SSEConnectionHandler.createNewConnection(sseId)
        expect(SSEConnectionHandler.connections[sseId]).to.exist
        SSEConnectionHandler.deleteConnection(sseId)
        expect(SSEConnectionHandler.connections[sseId]).to.not.exist
      })

      it("should do nothing if the connection doesn't exist", () => {
        let sseId = 'test_id'
        SSEConnectionHandler.createNewConnection(sseId)
        let connectionsBefore = Object.assign({}, SSEConnectionHandler.connections)
        SSEConnectionHandler.deleteConnection('random_stuff')
        expect(JSON.stringify(SSEConnectionHandler.connections)).to.equal(JSON.stringify(connectionsBefore))
      })
    })
  })
})
