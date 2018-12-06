<template>
  <v-container>
    <v-toolbar fixed class="light-blue accent-2" dark>
      <v-toolbar-items>
        <v-btn
          v-if="$store.state.isUserLoggedIn"
          flat
          class="blue-grey"
          v-on:click.stop="dialog = true">
          <v-icon>add</v-icon>
        </v-btn>
        <v-btn
          v-else
          flat
          class="blue-grey"
          v-on:click.stop="authDialog = true">
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
        <div class="danger-alert pb-2" v-html="error"/>
        <!-- <v-img :src="imageUrl"/> -->
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
    <v-dialog v-model="authDialog" transition="scale-transition" origin="center center" width="30%">
      <v-card>
        <v-card-title
          class="headline light-blue accent-2"
          dark>
          Sign Up or Log In
        </v-card-title>
        <v-card-text>
          You have to create an account before you can upload your own posts. Go ahead, it's quick and easy!
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="light-blue accent-2"
            flat
            @click="authDialog = false"
          >
            Okay
          </v-btn>
        </v-card-actions>
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
      authDialog: null,
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
      this.title = null
      this.description = null
      this.error = null
    },
    async submitImage () {
      this.error = null
      this.imageUrl = null
      this.filename = null
      let formData = new FormData()
      formData.append('image', this.image)
      formData.append('title', this.title)
      formData.append('description', this.description)
      this.image = null
      if (!this.title) {
        this.error = 'You have to give a title to your post'
        return
      }
      try {
        await UploadService.upload(formData)
      } catch (err) {
        this.error = err.response.data.error
      }
      this.dialog = false
      this.title = null
      this.description = null
    }
  }

}
</script>

<style scoped>
.upload_button {
  color: white;
}
.danger-alert {
  color: red;
}
</style>
