module.exports = {
  'Registration with valid credentials': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/register')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Register')
      .setValue('#username', 'testUser' + Math.floor(Math.random() * 1000))
      .setValue('#email', 'testEmail' + Math.floor(Math.random() * 1000) + '@testmail.com')
      .setValue('#password', 'testPassword' + Math.floor(Math.random() * 1000))
      .click('#registerBtn')
      .pause(2000)
      .assert.urlEquals(devServer + '/trending')
      .end()
  },

  'Registration with invalid credentials': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/register')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Register')
      .setValue('#username', 'admin')
      .setValue('#email', 'admin@admin.com')
      .setValue('#password', 'testPassword')
      .click('#registerBtn')
      .pause(1000)
      .assert.elementPresent('.v-alert.alert.red.lighten-2')
      .end()
  },

  'Login with valid credentials': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/login')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Login')
      .setValue('#username', 'admin')
      .setValue('#password', 'adminadmin')
      .click('#loginBtn')
      .pause(2000)
      .assert.urlEquals(devServer + '/trending')
      .end()
  },

  'Login with invalid credentials': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/login')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Login')
      .setValue('#username', 'random')
      .setValue('#password', 'randomrandom')
      .click('#loginBtn')
      .pause(1000)
      .assert.elementPresent('.v-alert.alert.red.lighten-2')
      .end()
  },

  'Password reset with existing email': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/forgotpassword')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Forgot Password')
      .setValue('#email', 'admin@admin.com')
      .click('#resetPwBtn')
      .pause(2000)
      .assert.urlEquals(devServer + '/trending')
      .end()
  },

  'Password reset with non-existent email': function (browser) {
    const devServer = browser.globals.devServerURL
    browser
      .url(devServer + '/forgotpassword')
      .assert.elementPresent('div.flex.xs11.sm6.md4.lg3')
      .assert.containsText('div.flex.xs11.sm6.md4.lg3', 'Forgot Password')
      .setValue('#email', 'random@randomrandom.com')
      .click('#resetPwBtn')
      .pause(1000)
      .assert.elementPresent('.v-alert.alert.red.lighten-2')
      .end()
  }
}
