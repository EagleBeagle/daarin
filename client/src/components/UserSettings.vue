<template>
  <v-layout mt-5 pt-3 justify-center>
    <v-flex xs10 sm8 md6 lg4>
      <v-card class="pa-3">
        <v-layout justify-center row wrap>
          <v-flex xs5 sm3 md3 lg3 offset-xs1 offset-sm3 offset-md3 offset-lg3>
            <v-avatar
              size="80">
              <v-img v-if="user.avatar" id="avatar" :src="user.avatar"></v-img>
              <v-icon v-else id="avatar-icon">fas fa-user-circle</v-icon>
            </v-avatar>
          </v-flex>
          <v-flex xs6 align-self-center>
            <div class="title leftText">testUser</div>
            <form>
              <div
                class="body-1 font-weight-bold light-blue--text leftText clickText"
                @click="onClickUpload">
                Change Avatar</div>
              <input
                type="file"
                style="display: none"
                ref="fileInput"
                accept="image/*"
                @change="onFileChosen">
            </form>
          </v-flex>
        </v-layout>
        <v-divider class="my-3 mx-2"/>
        <v-form ref="form">
          <v-layout justify-center row wrap>
            <v-flex xs6>
              <v-text-field
                label="Username"
                value="lelel">
              </v-text-field>
                <v-text-field
                  label="Email"
                  value="email">
              </v-text-field>
              <div
                v-if="!changingPassword"
                class="body-1 light-blue--text font-weight-bold mt-2 clickText"
                @click="changingPassword = true">
                Change Password
              </div>
              <div v-if="changingPassword">
                <v-text-field
                  label="Old Password"
                  class="mt-2">
                </v-text-field>
                <v-text-field
                    label="New Password">
                </v-text-field>
                <v-text-field
                    label="Confirm New Password">
                </v-text-field>
              </div>
            </v-flex>
          </v-layout>
          <v-divider class="my-3 mx-2"/>
          <v-layout justify-center>
            <v-btn
              class="light-blue lighten-2"
              flat>
              Submit
            </v-btn>
          </v-layout>
        </v-form>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapState} from 'vuex'
import UserService from '@/services/UserService'
export default {
  data () {
    return {
      changingPassword: false,
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
  },
  methods: {
    onClickUpload () {
      this.$refs.fileInput.click()
    },
    async onFileChosen () { // TODO validation
      let avatar = event.target.files[0]
      let formData = new FormData()
      formData.append('image', avatar)
      try {
        let user = await UserService.changeAvatar(formData, this.user._id)
        this.$store.dispatch('changeUserAvatar', user.data.avatar)
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style scoped>
#avatar-icon {
  font-size: 80px;
}
.leftText {
  text-align: left;
}
.clickText {
  cursor: pointer;
}
</style>
