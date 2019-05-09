<template>
  <v-dialog v-model="show"  transition="scale-transition" origin="center center" width="30%">
    <v-card>
      <v-toolbar flat dark class="light-blue accent-2">
        <v-btn icon @click.native="onClose" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Upload a Post</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark flat @click="submitImage">Save</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-container ma-0 pa-0>
        <v-layout justify-start id="uploadBox" mt-4 mx-4 style="height: 300px">
          <v-flex align-self-center>
            asd
          </v-flex>
        </v-layout>
      </v-container>
      <div class="pl-5 pr-5 pt-3 pb-4">
          <v-form
            name ="form"
            autocomplete="off">
            <v-text-field
              label="Title"
              :rules="[required]"
              v-model="title"
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
          </v-form>
      </div>
      <div class="danger-alert pb-2" v-html="error"/>
    </v-card>
  </v-dialog>
</template>

<script>
import PostService from '@/services/PostService'
export default {
  data () {
    return {
      title: null,
      filename: null,
      image: null,
      error: null,
      required: (v) => !!v || 'Required.'
    }
  },
  props: {
    value: Boolean
  },
  computed: {
    show: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  mounted () {
    let uploadBox = document.getElementById('uploadBox')
    console.log(uploadBox)
    uploadBox.addEventListener('drop', function (e) {
      e.preventDefault()
      this.image = e.dataTransfer.files[0]
      console.log(this.image)
    })
  },
  methods: {
    async onFileChosen (event) {
      const files = event.target.files
      this.filename = files[0].name
      if (this.filename.lastIndexOf('.') <= 0) {
        return alert('The given file is not valid') //  TODO
      }
      this.image = files[0]
    },
    onClickUpload () {
      this.$refs.fileInput.click()
    },
    async submitImage () {
      this.error = null
      this.imageUrl = null
      this.filename = null
      let formData = new FormData()
      formData.append('image', this.image)
      formData.append('title', this.title)
      formData.append('createdBy', this.$store.state.user._id)
      try {
        let result = await PostService.upload(formData)
        this.show = false
        let postId = result.data._id
        this.$router.push({ name: 'postPage', params: { postId: postId } })
        this.$store.dispatch('setSnackbarText', 'Post uploaded successfully.')
      } catch (error) {
        this.error = error.response.data.error
        return
      }
      this.image = null
      //  this.dialog = false
      this.title = null
    },
    onClose () {
      this.show = false
      this.filename = null
      this.imageUrl = null
      this.image = null
      this.title = null
      //  this.error = null
    }
  }
}
</script>

<style scoped>
  #uploadBox {
    border-style: solid;
    border-width: 2px;
    border-color: #9E9E9E;
  }
</style>
