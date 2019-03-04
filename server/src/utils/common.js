module.exports = {
  setIntervalSync (func, delay) {
    var intervalFunction, timeoutId, clear
    clear = function () {
      clearTimeout(timeoutId)
    }
    intervalFunction = function () {
      func()
      timeoutId = setTimeout(intervalFunction, delay)
    }
    timeoutId = setTimeout(intervalFunction, delay)
    return clear
  }
}
