<template>
  <v-layout justify-center pt-5 mt-5>
    <v-flex xs11 sm6 md4 lg3>
      <panel title="Login">
          <form
            name ="login-form"
            autocomplete="on">
            <v-text-field
              label="Username"
              v-model="username"
            ></v-text-field>
            <v-text-field
              type="password"
              label="Password"
              v-model="password"
              v-on:keyup.enter="login"
            ></v-text-field>
          </form>
          <v-btn
            dark
            class="light-blue accent-2"
            @click="login">
            Login
          </v-btn>
      </panel>
      <v-alert
        v-model="alert"
        class="alert"
        color="red lighten-2"
        type="error"
        transition="fadeDown">
        {{ alertMessage }}
      </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
import AuthenticationService from '@/services/AuthenticationService'
export default {
  data () {
    return {
      username: null,
      password: null,
      error: null,
      alert: false,
      alertMessage: null
    }
  },
  methods: {
    async login () {
      this.error = null
      const areAllFieldsFilledIn = (this.username && this.password)
      if (!areAllFieldsFilledIn) {
        this.alertMessage = 'Please fill in all the required fields'
        this.alert = true
        setTimeout(() => {
          this.alert = false
        }, 3000)
        return
      }
      try {
        const response = await AuthenticationService.login({
          username: this.username,
          password: this.password
        })
        this.$store.dispatch('setToken', response.data.token)
        this.$store.dispatch('setUser', response.data.user)
        await this.$store.dispatch('updateEventSource')
        this.$router.push({
          name: 'home'
        })
      } catch (error) {
        this.alertMessage = error.response.data.error
        this.alert = true
        setTimeout(() => {
          this.alert = false
        }, 3000)
      }
    }
  }
}
</script>

<style scoped>
.danger-alert {
  color: red;
}
</style>
