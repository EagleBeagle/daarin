<template>
    <v-flex xs4 offset-xs4>
      <div class="white elevation-2">
        <v-toolbar flat dense class="cyan" dark>
          <v-toolbar-title>Register</v-toolbar-title>
        </v-toolbar>
        <div class="pl-4 pr-4 pt-2 pb-2">
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
          <br>
          <div class="danger" v-html="error"/>
          <br>
          <v-btn
            class="cyan"
            @click="register">
            Register
          </v-btn>
        </div>
      </div>
    </v-flex>
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
        await AuthenticationService.register({
          username: this.username,
          email: this.email,
          password: this.password
        })
        this.$router.push({
          name: 'HelloWorld'
        })
      } catch (error) {
        this.error = error.response.data.error
      }
    }
  }
}
</script>

<style scoped>
.danger {
  color: red;
}
</style>
