<template>
  <v-container>
  </v-container>
</template>

<script>
import AuthenticationService from '@/services/AuthenticationService'
export default {
  async mounted () {
    try {
      let result = await AuthenticationService.verify(this.$route.query.id)
      if (result.data.status === 'success') {
        this.$store.dispatch('setSnackbarText', 'Your account is now verified.')
        this.$store.dispatch('setUserConfirmed', result.data.user)
      } else if (result.data.status === 'verified') {
        this.$store.dispatch('setSnackbarText', 'You have already verified your account.')
      }
    } catch (err) {
      this.$store.dispatch('setSnackbarText', 'Error during account verification.')
    }
    this.$router.push('/trending')
  }
}
</script>

<style scoped>
</style>
