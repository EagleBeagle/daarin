module.exports = {
  sseMiddleware (req, res, next) {
    res.sseSetup = function () {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      })
    }

    res.sseSend = function (event, data) {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }
    next()
  }
}
