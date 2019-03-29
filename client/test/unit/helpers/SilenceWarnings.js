export class SilenceVuetifyWarn {
  constructor () {
    this.originalLogError = console.error
  }
  enable () {
    console.error = (...args) => {
      if (args[0].includes('[Vuetify]') && args[0].includes('https://github.com/vuetifyjs/vuetify/issues/4068')) return
      this.originalLogError(...args)
    }
  }
  disable () {
    console.error = this.originalLogError
  }
}
