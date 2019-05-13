<template>
  <v-layout justify-center pt-5 mt-5>
    <v-flex xs11 sm6 md4 lg3>
      <panel title="Reset Password">
          <v-form
            ref="form"
            v-model="valid"
            autocomplete="off">
            <v-text-field
              type="password"
              label="New Password"
              :rules="newPasswordRules"
              v-model="newPasswordField"
              class="mx-5 px-5 mt-3 mb-3"
            ></v-text-field>
            <v-text-field
              type="password"
              label="Confirm New Password"
              :rules="confirmPasswordRules"
              v-model="confirmPasswordField"
              class="mx-5 px-5 pb-3"
            ></v-text-field>
          </v-form>
          <v-btn
            dark
            class="light-blue accent-2"
            @click="submit">
            Submit
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
      newPasswordField: null,
      confirmPasswordField: null,
      alert: false,
      alertMessage: null,
      newPasswordRules: [
        v => !!v || "This field can't stay empty.",
        v => (v && v.length > 7) || 'The password has to be at least 8 characters long.',
        v => (v && v.length < 33) || "The password can't exceed 32 characters."
      ],
      confirmPasswordRules: [
        v => !!v || "This field can't stay empty.",
        v => v === this.newPasswordField || "The passwords don't match."
      ]
    }
  },
  methods: {
    async submit () {
      if (this.$refs.form.validate()) {
        try {
          await AuthenticationService.resetPassword(this.$route.query.id, this.newPasswordField)
          this.$store.dispatch('setSnackbarText', 'You have succesfully reset your password.')
          this.$router.push('trending')
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
}
</script>

<style scoped>

</style>
