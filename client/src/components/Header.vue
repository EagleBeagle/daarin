<template>
  <v-container>
    <v-toolbar fixed class="light-blue accent-2" dark>
      <v-toolbar-items>
        <v-btn
          flat
          class="blue-grey"
          v-on:click.stop="dialog = true">
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-title dark class="mr-4">
        <router-link
          flat
          class="font-weight-light display-2"
          :to="{ name: 'Home' }"
          :style="{ cursor: 'pointer' }"
          tag="span">
          daarin
          </router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          v-if="!$store.state.isUserLoggedIn"
          flat
          dark
          :to="{
            name: 'login'
          }">
          Login
        </v-btn>
        <v-btn
          v-if="!$store.state.isUserLoggedIn"
          flat
          dark
          :to="{
            name: 'register'
          }">
          Sign Up
        </v-btn>

        <v-btn
          v-if="$store.state.isUserLoggedIn"
          flat
          dark
          @click="logout">
          Log Out
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-dialog v-model="dialog"  transition="scale-transition" origin="center center" width="30%">
      <v-card>
        <v-toolbar dark class="light-blue accent-2">
          <v-btn icon @click.native="onClose" dark>
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>Upload a Post</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark flat @click="submitImage">Save</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div class="pl-5 pr-5 pt-3 pb-4">
            <form
              name ="register-form"
              autocomplete="off">
              <v-text-field
                label="Title"
                :rules="[required]"
                v-model="title"
              ></v-text-field>
              <v-text-field
                label="Description"
                v-model="description"
              ></v-text-field>
              <v-layout justify-center fill-height>
                <v-btn class="light-blue accent-2" @click="onClickUpload">Choose File</v-btn>
                <br>
                <div class="pt-2" >
                  <h2>{{ filename }}</h2>
                </div>
              </v-layout>
              <input
                type="file"
                style="display: none"
                ref="fileInput"
                accept="image/*"
                @change="onFileChosen">
            </form>
        </div>
        <div class="danger-alert" v-html="error"/>
        <v-img v-if="imageUrl" :src="imageUrl" width="100%"/>
        <!-- <v-card-actions>
          <v-layout justify-center>
          <v-btn flat dark class="red">category1</v-btn>
          <v-btn flat class="orange">category2</v-btn>
          <v-btn flat class="yellow">category3</v-btn>
          <v-btn flat class="green">category4</v-btn>
          <v-btn flat class="blue">category5</v-btn>
          </v-layout>
        </v-card-actions> -->
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import UploadService from '@/services/UploadService'
export default {
  data () {
    return {
      dialog: null,
      filename: null,
      title: null,
      description: null,
      imageUrl: null,
      image: null,
      error: null,
      required: (value) => !!value || 'Required.'
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('setToken', null)
      this.$store.dispatch('setUser', null)
      this.$router.push({
        name: 'Home'
      })
    },
    onClickUpload () {
      this.$refs.fileInput.click()
    },
    onFileChosen (event) {
      const files = event.target.files
      this.filename = files[0].name
      if (this.filename.lastIndexOf('.') <= 0) {
        return alert('The given file is not valid') //  TODO
      }
      const fileReader = new FileReader()

      fileReader.readAsDataURL(files[0], function () {
        this.imageUrl = fileReader.result
      })
      this.image = files[0]
    },
    onClose () {
      this.dialog = false
      this.filename = null
      this.imageUrl = null
      this.image = null
    },
    async submitImage () {
      this.dialog = false
      this.imageUrl = null
      this.filename = null
      let formData = new FormData()
      formData.append('image', this.image)
      this.image = null
      try {
        await UploadService.upload(formData)
      } catch (err) {
        this.error = err.response.data.error
      }
    }
  }

}
</script>

<style scoped>
.upload_button {
  color: white;
}
</style>
