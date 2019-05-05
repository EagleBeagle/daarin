<template>
  <v-layout v-if="shownUser" justify-center row wrap>
      <v-flex mt-4 xs12 sm12 md10 lg5 align-self-center>
        <v-layout justify-center row-wrap mx-0 px-0>
        <v-flex ml-5 pl-5 xs12 sm12 md4 lg6>
          <v-avatar
            size="170">
            <v-img v-if="shownUser.avatar" id="avatar" :src="shownUser.avatar"></v-img>
            <v-icon v-else id="avatar-icon">fas fa-user-circle</v-icon>
          </v-avatar>
        </v-flex>
        <v-flex xs12 sm12 md4 lg5 align-self-center>
          <v-layout row wrap mr-4 pr-4 align-center justify-start>
            <v-flex xs12 mb-3>
              <span class="display-1">{{ shownUser.username }}</span>
              <v-btn
                v-if="user && user.username === shownUser.username"
                @click="$router.push({ name: 'userSettings', params: { userId: shownUser._id } })"
                flat
                small
                absolute
                class="ml-2 settingsButton"
                fab>
                <v-icon
                  class="grey--text"
                  >settings
                </v-icon>
              </v-btn>
            </v-flex>
            <v-flex xs6 class="userInfoFlex">
              <transition :name="postCountDirection" mode="out-in">
                <span :key="postCount" class="title light-blue--text font-weight-bold light-blue--lighten-2">{{ postCount }}</span>
              </transition>
              <span class="body-1">posts</span>
            </v-flex>
            <v-flex xs6 class="userInfoFlex">
              <transition :name="reactionCountDirection" mode="out-in">
                <span :key="reactionCount" class="title light-blue--text font-weight-bold light-blue--lighten-2">{{ reactionCount }}</span>
              </transition>
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
      shownUser: null,
      active: null,
      userStreamCb: null,
      postCountDirection: null,
      reactionCountDirection: null
    }
  },
  async mounted () {
    if (this.$route.params.userId) {}
    await this.getUser()
    await this.addSSEListener()
    console.log(this.shownUser)
  },
  beforeDestroy () {
    this.eventSource.removeEventListener('user', this.userStreamCb)
  },
  computed: {
    ...mapState([
      'eventSource',
      'user'
    ]),
    postCount: function () {
      if (this.shownUser) {
        return this.shownUser.postCount
      }
    },
    reactionCount: function () {
      if (this.shownUser) {
        return this.shownUser.reactionCount
      }
    }
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
    },
    postCount (newVal, oldVal) {
      if (newVal > oldVal) {
        this.postCountDirection = 'scoreUp'
      } else {
        this.postCountDirection = 'scoreDown'
      }
    },
    reactionCount (newVal, oldVal) {
      if (newVal > oldVal) {
        this.reactionCountDirection = 'scoreUp'
      } else {
        this.reactionCountDirection = 'scoreDown'
      }
    }
  },
  methods: {
    async addSSEListener () {
      if (this.user) {
        this.userStreamCb = (event) => {
          let streamedUser = JSON.parse(event.data)
          this.shownUser = streamedUser[0]
          console.log(streamedUser)
        }
        this.eventSource.addEventListener('user', this.userStreamCb)
      }
    },
    async getUser () {
      try {
        let response = await UserService.getUser(this.$route.params.userId)
        this.shownUser = response.data[0]
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>
.settingsButton {
  z-index: 0;
}
#avatar-icon {
  font-size: 170px;
}
.scoreUp-enter-active {
  transition: all .3s ease;
}
.scoreUp-leave-active {
  transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scoreUp-enter
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateY(10px);
  opacity: 0;
}

.scoreUp-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.scoreDown-enter-active {
  transition: all .2s ease;
}
.scoreDown-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.scoreDown-enter
/* .slide-fade-leave-active for <2.1.8 */ {
  transform: translateY(-10px);
  opacity: 0;
}

.scoreDown-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

.userInfoFlex {
  overflow: visible;
}
</style>
