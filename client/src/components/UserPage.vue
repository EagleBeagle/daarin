<template>
  <v-container>
    <span v-if="user" class="body-1">{{ user.username }}</span>
  </v-container>
</template>

<script>
import UserService from '@/services/UserService'
export default {
  data () {
    return {
      user: null
    }
  },
  async mounted () {
    await this.getUser()
  },
  methods: {
    async getUser () {
      try {
        let response = await UserService.getUser(this.$route.params.userId)
        this.user = response.data
        console.log(this.user)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>

</style>
