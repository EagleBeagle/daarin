module.exports = {
  'Successfully adding a comment': function (browser) {
    const devServer = browser.globals.devServerURL
    const randomComment = 'comment' + Math.floor(Math.random() * 10000)
    browser
      .url(devServer + '/login')
      .setValue('#username', 'admin')
      .setValue('#password', 'adminadmin')
      .click('#loginBtn')
      .pause(2000)
      .click('.commentBtn:nth-of-type(1)')
      .pause(2000)
      .setValue('#commentText', randomComment)
      .pause(2000)
      .click('#submitCommentBtn')
      .pause(2000)
      .assert.elementPresent('#commentBody')
      .assert.containsText('#commentBody', randomComment)
      .click('.commentBtn:nth-of-type(1)')
  },

  'Successfully rendering comments': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/trending')
      .pause(2000)
      .click('.commentBtn:nth-of-type(1)')
      .pause(2000)
      .assert.elementPresent('#commentBody')
  },

  'Opening and closing comment section works as intended': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/trending')
      .pause(2000)
      .click('.commentBtn:nth-of-type(1)')
      .pause(2000)
      .assert.elementPresent('#commentBody')
      .click('.commentBtn:nth-of-type(1)')
      .pause(2000)
      .assert.elementNotPresent('#commentBody')
  }
}
