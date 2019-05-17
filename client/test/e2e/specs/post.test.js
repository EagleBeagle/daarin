module.exports = {
  'Successfully uploading an image and creating a post': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/login')
      .setValue('#username', 'admin')
      .setValue('#password', 'adminadmin')
      .click('#loginBtn')
      .pause(2000)
      .click('#uploadBtn')
      .pause(2000)
      .setValue('input[type="file"]', require('path').resolve(__dirname + '/../test_image.png'))
      .pause(2000)
      .setValue('#title', 'testImage')
      .click('#submitBtn')
      .pause(10000)
      .assert.elementCount('.post', 1)
      .assert.elementCount('.postImage', 1)
  },

  'Testing correct rendering of posts on a feed': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/trending')
      .assert.elementCount('.post', 5)
      .assert.elementCount('.postImage', 5)
      .end()
  },

  'Reacting to posts and unreacting works as intended': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/login')
      .setValue('#username', 'admin')
      .setValue('#password', 'adminadmin')
      .click('#loginBtn')
      .pause(2000)
      .assert.urlEquals(devServer + '/trending')
      .assert.cssClassNotPresent('.reaction0icon', 'amber--darken-4')
      .click('.reaction0')
      .pause(1000)
      .assert.cssClassPresent('.reaction0icon', 'amber--darken-4')
      .click('.reaction0')
      .pause(1000)
      .assert.cssClassNotPresent('.reaction0icon', 'amber--darken-4')
      .end()
  },

  'Clicking to a post brings us to its own page with similar posts listed': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/trending')
      .click('.postImage')
      .pause(2000)
      .assert.urlContains('post')
      .assert.elementCount('.post', 4)
      .assert.elementCount('.postImage', 4)
  }

}
