<template>
  <v-layout justify-center>
    <v-flex xs3>
      <panel title="Register">
          <form
            name ="register-form"
            autocomplete="off">
            <v-text-field
              label="Username"
              :rules="[required]"
              v-model="username"
            ></v-text-field>
            <v-text-field
              label="Email"
              :rules="[required]"
              v-model="email"
            ></v-text-field>
            <v-text-field
              type="password"
              :rules="[required]"
              label="Password"
              v-model="password"
            ></v-text-field>
          </form>
          <br>
          <div class="danger-alert" v-html="error"/>
          <br>
          <v-btn
            class="light-blue accent-2"
            @click="register">
            Register
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
      email: null,
      password: null,
      error: null,
      required: (value) => !!value || 'Required.'
    }
  },
  methods: {
    async register () {
      this.error = null
      const areAllFieldsFilledIn = (this.username && this.email && this.password)
      if (!areAllFieldsFilledIn) {
        this.error = 'Please fill in all the required fields'
        return
      }
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
          name: 'home'
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
