<template>
  <v-layout justify-center>
    <v-flex xs3>
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
            ></v-text-field>
          </form>
          <br>
          <div class="danger-alert" v-html="error"/>
          <br>
          <v-btn
            dark
            class="light-blue accent-2"
            @click="login">
            Login
          </v-btn>
      </panel>
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
      error: null
    }
  },
  methods: {
    async login () {
      this.error = null
      const areAllFieldsFilledIn = (this.username && this.password)
      if (!areAllFieldsFilledIn) {
        this.error = 'Please fill in all the required fields'
        return
      }
      try {
        const response = await AuthenticationService.login({
          username: this.username,
          password: this.password
        })
        this.$store.dispatch('setToken', response.data.token)
        this.$store.dispatch('setUser', response.data.user)
        this.$router.push({
          name: 'Home'
        })
      } catch (error) {
        this.error = error.response.data.error
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
