<template>
  <v-layout justify-center pt-5 mt-5>
    <v-flex xs11 sm6 md4 lg3>
      <panel title="Forgot Password">
          <div class="body-1 font-weight-bold my-3">Enter your email address to reset your password.</div>
          <form
            name ="form"
            autocomplete="off">
            <v-text-field
              id="email"
              label="Email"
              v-model="email"
              class="mx-5 px-5 my-3"
            ></v-text-field>
          </form>
          <v-btn
            dark
            class="light-blue accent-2"
            id="resetPwBtn"
            @click="reset">
            Reset Password
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
      email: null,
      alert: false,
      alertMessage: null
    }
  },
  methods: {
    async reset () {
      if (!this.email) {
        this.alertMessage = 'Please fill in the email field.'
        this.alert = true
        setTimeout(() => {
          this.alert = false
        }, 3000)
        return
      }
      try {
        await AuthenticationService.forgotPassword(this.email)
        this.$store.dispatch('setSnackbarText', 'An email has been sent to you with a link to reset your password.')
        this.$router.push('/trending')
      } catch (err) {
        this.alertMessage = err.response.data.error
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

</style>
