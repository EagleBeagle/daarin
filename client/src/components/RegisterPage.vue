<template>
  <v-layout justify-center pt-5 mt-5>
    <v-flex xs11 sm6 md4 lg3>
      <panel title="Register">
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
            autocomplete="off">
            <v-text-field
              label="Username"
              :rules="usernameRules"
              v-model="username"
            ></v-text-field>
            <v-text-field
              type="email"
              label="Email"
              :rules="emailRules"
              v-model="email"
            ></v-text-field>
            <v-text-field
              type="password"
              :rules="passwordRules"
              label="Password"
              v-model="password"
              v-on:keyup.enter="register"
            ></v-text-field>
          </v-form>
          <br>
          <br>
          <v-btn
            class="light-blue accent-2"
            @click="register">
            Register
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
      valid: true,
      username: null,
      email: null,
      password: null,
      usernameRules: [
        v => !!v || "The username can't stay empty.",
        v => (v && v.length > 3) || 'The username has to be at least 4 characters long.',
        v => (v && v.length < 16) || "The username can't be longer than 15 characters.",
        v => /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(v) || 'This username format is not allowed.'
      ],
      emailRules: [
        v => !!v || "Email can't stay empty.",
        v => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/igm.test(v) || 'E-mail must be valid.'
      ],
      passwordRules: [
        v => !!v || "Password can't stay empty.",
        v => (v && v.length > 7) || 'The password has to be at least 8 characters long.',
        v => (v && v.length < 33) || "The password can't exceed 32 characters."
      ],
      alert: false,
      alertMessage: null
    }
  },
  methods: {
    async register () {
      if (this.$refs.form.validate()) {
        try {
          const response = await AuthenticationService.register({
            username: this.username,
            email: this.email,
            password: this.password
          })
          this.$store.dispatch('setToken', response.data.token)
          this.$store.dispatch('setUser', response.data.user)
          await this.$store.dispatch('updateEventSource')
          this.$router.push({
            name: 'trending'
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
}
</script>

<style scoped>
.danger-alert {
  color: red;
}
</style>
