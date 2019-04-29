<template>
  <v-layout v-if="user" justify-center row wrap>
      <v-flex mt-4 xs12 sm12 md6 lg6 align-self-center>
        <v-layout justify-center row-wrap mx-0 px-0>
        <v-flex ml-5 pl-5 xs6 sm4 md4 lg4>
          <v-avatar
            size="170">
            <v-img id="avatar" src="http://res.cloudinary.com/daarin/image/upload/v1553966054/kkrlwpyyo9zhtfr8tgsf.jpg"></v-img>
          </v-avatar>
        </v-flex>
        <v-flex xs4 align-self-center>
          <v-layout row wrap mr-4 pr-4 align-center justify-start>
            <v-flex xs12 mb-3>
              <span class="display-1">{{ user.username }}</span>
            </v-flex>
            <v-flex xs6>
              <span class="title light-blue--text font-weight-bold light-blue--lighten-2">99</span>
              <span class="body-1">posts</span>
            </v-flex>
            <v-flex xs6>
              <span class="title light-blue--text font-weight-bold light-blue--lighten-2">99</span>
              <span class="body-1">reactions</span>
            </v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
      <v-divider class="mt-5 mb-0 pb-0"/>
      </v-flex>
      <v-flex xs12 mt-5 mb-3>
        <v-tabs
          v-model="active"
          centered
          fixed-tabs
          color="#ECEFF1"
          slider-color="light-blue lighten-2"
          class="pt-0 mt-0">
          <v-tab>
            Posts
          </v-tab>
          <v-tab>
            Reactions
          </v-tab>
          <v-tab>
            Comments
          </v-tab>
        </v-tabs>
      </v-flex>
  </v-layout>
</template>

<script>
import UserService from '@/services/UserService'
import {mapState} from 'vuex'
export default {
  data () {
    return {
      user: null,
      active: null
    }
  },
  async mounted () {
    await this.getUser()
    console.log(this.user)
  },
  computed: {
    ...mapState([
      'eventSource'
    ])
  },
  watch: {
    active (val) {
      console.log('itten')
      if (val === 0) {
        this.$emit('switchedTab', 'own')
      } else if (val === 1) {
        this.$emit('switchedTab', 'reacted')
      } else if (val === 2) {
        this.$emit('switchedTab', 'commented')
      }
    }
  },
  methods: {
    async getUser () {
      try {
        let response = await UserService.getUser(this.$route.params.userId)
        this.user = response.data
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>

</style>
