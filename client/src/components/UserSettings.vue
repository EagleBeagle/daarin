<template>
  <v-layout mt-5 pt-3 justify-center>
    <v-flex xs4>
      <v-card class="pa-3">
        <v-layout justify-center row wrap>
          <v-flex xs3 offset-xs3>
            <v-avatar
              size="80">
              <v-img id="avatar" src="http://res.cloudinary.com/daarin/image/upload/v1553966054/kkrlwpyyo9zhtfr8tgsf.jpg"></v-img>
            </v-avatar>
          </v-flex>
          <v-flex xs6 align-self-center>
            <div class="title leftText">testUser</div>
            <div class="body-1 font-weight-bold light-blue--text leftText clickText">Change Avatar</div>
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
export default {
  data () {
    return {
      changingPassword: false
    }
  }
}
</script>

<style scoped>
.leftText {
  text-align: left;
}
.clickText {
  cursor: pointer;
}
</style>
