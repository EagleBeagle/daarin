<template>
  <v-layout mt-5 pt-3 justify-center>
    <v-flex xs10 sm8 md6 lg4>
      <v-card class="pa-3">
        <v-layout justify-center row wrap>
          <v-flex xs5 sm3 md3 lg3 offset-xs1 offset-sm3 offset-md3 offset-lg3>
            <v-progress-circular
              v-if="avatarLoading"
              :size="80"
              :width="5"
              color="light-blue accent-2"
              indeterminate>
            </v-progress-circular>
            <v-avatar
              v-if="!avatarLoading"
              size="80">
              <v-img v-if="user.avatar" id="avatar" :src="user.avatar"></v-img>
              <v-icon v-else id="avatar-icon">fas fa-user-circle</v-icon>
            </v-avatar>
          </v-flex>
          <v-flex xs6 align-self-center>
            <div class="title leftText">{{ user.username }}</div>
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
        <v-form
          ref="form"
          v-model="valid"
          lazy-validation>
          <v-layout justify-center row wrap>
            <v-flex xs6>
              <v-text-field
                v-model="usernameField"
                :rules="usernameRules"
                label="Username">
              </v-text-field>
                <v-text-field
                  v-model="emailField"
                  :rules="emailRules"
                  label="Email">
              </v-text-field>
              <div
                v-if="!changingPassword"
                class="body-1 light-blue--text font-weight-bold mt-2 clickText"
                @click="changingPassword = true">
                Change Password
              </div>
              <div v-if="changingPassword">
                <v-text-field
                  v-model="oldPasswordField"
                  type="password"
                  :rules="oldPasswordRules"
                  label="Old Password"
                  class="mt-2">
                </v-text-field>
                <v-text-field
                  type="password"
                  v-model="newPasswordField"
                  :rules="newPasswordRules"
                  label="New Password">
                </v-text-field>
                <v-text-field
                  type="password"
                  v-model="confirmPasswordField"
                  :rules="confirmPasswordRules"
                  label="Confirm New Password">
                </v-text-field>
              </div>
            </v-flex>
          </v-layout>
          <v-divider class="my-3 mx-2"/>
          <v-layout justify-center>
            <v-btn
              :disabled="!valid"
              color="light-blue lighten-2"
              @click="submitSettings">
              Save Settings
            </v-btn>
          </v-layout>
        </v-form>
      </v-card>
      <v-alert
        v-model="successAlert"
        class="alert"
        color="light-blue lighten-2"
        type="success"
        transition="fadeDown">
        {{ alertMessage }}
    </v-alert>
    <v-alert
        v-model="errorAlert"
        class="alert"
        color="red lighten-1"
        type="error"
        transition="fadeDown">
        {{ alertMessage }}
    </v-alert>
    </v-flex>
  </v-layout>
</template>

<script>
import {mapState} from 'vuex'
import UserService from '@/services/UserService'
export default {
  data () {
    return {
      valid: true,
      changingPassword: false,
      usernameField: null,
      emailField: null,
      oldPasswordField: null,
      newPasswordField: null,
      confirmPasswordField: null,
      successAlert: false,
      errorAlert: false,
      alertMessage: null,
      avatarLoading: false,
      usernameRules: [
        v => !!v || "Username can't stay empty.",
        v => (v && v.length > 3) || 'The username has to be at least 4 characters long.',
        v => (v && v.length < 16) || "The username can't be longer than 15 characters."
      ],
      emailRules: [
        v => !!v || "Email can't stay empty.",
        v => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/igm.test(v) || 'E-mail must be valid.'
      ],
      oldPasswordRules: [
        v => !!v || "This field can't stay empty.",
        v => (v && v.length > 7) || 'The password has to be at least 8 characters long.'
      ],
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
  computed: {
    ...mapState([
      'user'
    ])
  },
  mounted () {
    this.usernameField = this.user.username
    this.emailField = this.user.email
  },
  methods: {
    onClickUpload () {
      this.$refs.fileInput.click()
    },
    async onFileChosen () { // TODO validation
      this.avatarLoading = true
      let avatar = event.target.files[0]
      let formData = new FormData()
      formData.append('image', avatar)
      try {
        let user = await UserService.changeAvatar(formData, this.user._id)
        this.$store.dispatch('changeUserAvatar', user.data.avatar)
      } catch (err) {
        console.log(err)
      }
      this.avatarLoading = false
    },
    async submitSettings () {
      if (this.$refs.form.validate()) {
        try {
          await UserService.changeUserSettings(this.user._id, {
            username: this.usernameField,
            email: this.emailField,
            oldPassword: this.oldPasswordField,
            newPassword: this.newPasswordField,
            confirmPassword: this.confirmPasswordField
          })
          this.$store.dispatch('changeUserCredentials', {
            username: this.usernameField,
            email: this.emailField
          })
          this.alertMessage = 'Your changes have been saved.'
          this.errorAlert = false
          this.successAlert = true
          this.changingPassword = false
          setTimeout(() => {
            this.successAlert = false
          }, 3000)
        } catch (err) {
          this.alertMessage = err.response.data.error
          this.successAlert = false
          this.errorAlert = true
          setTimeout(() => {
            this.successAlert = false
          }, 3000)
        }
      }
    }
  }
}
</script>

<style scoped>
.alert {
  animation-duration: 200ms;
}
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
