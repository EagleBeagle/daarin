<template>
  <v-dialog v-model="show"  transition="scale-transition" origin="center center" width="30%">
    <v-card>
      <v-toolbar flat dark class="light-blue accent-2">
        <v-btn icon @click.native="onClose" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title>Create a New Post</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn v-if="!uploadLoading && image" dark flat @click="submitImage">Save</v-btn>
          <v-progress-circular
              v-if="uploadLoading"
              :size="32"
              :width="3"
              color="white"
              class="mt-3"
              indeterminate>
            </v-progress-circular>
        </v-toolbar-items>
      </v-toolbar>
      <VueFullScreenFileDrop text="Drop to Upload" @drop='onDrop'/>
      <v-container v-if="!image" class="pt-3 pb-4">
          <div class="red--text pt-2 pb-2 mb-3" style="background-color: #FFCDD2" v-if="error">{{ errorMessage }}</div>
          <v-layout class="uploadBox px-5">
            <v-flex align-self-center>
              <v-icon style="font-size: 80px" class="mb-5">fas fa-file-image</v-icon>
              <div class="body-1 font-weight-bold light-blue--text">Drop your image here or click the button to</div>
              <form
                name ="form"
                autocomplete="off">
                  <v-btn class="light-blue accent-2" @click="onClickUpload">Browse</v-btn>
                  <br>
                <input
                  type="file"
                  style="display: none"
                  ref="fileInput"
                  accept="image/*"
                  @change="onFileChosen">
              </form>
            </v-flex>
          </v-layout>
      </v-container>
      <v-container v-else pl-4 pr-4 pt-3 pb-4>
        <div class="red--text pt-2 pb-2 mb-3" style="background-color: #FFCDD2" v-if="error">{{ errorMessage }}</div>
        <v-layout row wrap>
          <v-flex xs4 align-self-center mr-3>
            <v-img :src="imagePreview"></v-img>
          </v-flex>
          <v-divider vertical class="mr-3"/>
          <v-flex xs7 align-self-center>
            <v-text-field
              label="Title"
              :rules="[required]"
              v-model="title">
            </v-text-field>
            <v-text-field
              label='Tag1, Tag2, Tag3...'
              v-model="tags">
            </v-text-field>
          </v-flex>
        </v-layout>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import PostService from '@/services/PostService'
import VueFullScreenFileDrop from 'vue-full-screen-file-drop'
import 'vue-full-screen-file-drop/dist/vue-full-screen-file-drop.css'
export default {
  data () {
    return {
      title: null,
      tags: null,
      extractedTags: [],
      image: null,
      imagePreview: null,
      error: false,
      errorMessage: null,
      uploadLoading: false,
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
  watch: {
    show (val) {
      if (!val) {
        setTimeout(() => {
          this.title = null
          this.tags = null
          this.image = null
          this.imagePreview = null
          this.error = false
          this.errorMessage = null
          this.uploadLoading = false
        }, 500)
      } else {
        this.title = null
        this.tags = null
        this.image = null
        this.imagePreview = null
        this.error = false
        this.errorMessage = null
        this.uploadLoading = false
      }
    }
  },
  methods: {
    async onFileChosen (event) {
      let acceptedTypes = ['image/jpeg', 'image/png', 'image/gif']
      let image = event.target.files[0]
      if (image && acceptedTypes.includes(image['type'])) {
        this.image = image
        this.imagePreview = URL.createObjectURL(image)
      } else {
        this.errorMessage = 'Unsupported type'
        this.error = true
      }
    },
    async onDrop (formData, files) {
      let acceptedTypes = ['image/jpeg', 'image/png', 'image/gif']
      let image = files[0]
      if (image && acceptedTypes.includes(image['type'])) {
        this.image = image
        this.imagePreview = URL.createObjectURL(image)
      } else {
        this.errorMessage = 'Unsupported type'
        this.error = true
      }
    },
    onClickUpload () {
      this.$refs.fileInput.click()
    },
    async submitImage () {
      let formData = new FormData()
      formData.append('image', this.image)
      formData.append('title', this.title)
      formData.append('createdBy', this.$store.state.user._id)
      if (this.tags && this.tags !== '') {
        if (this.extractAndVerifyTags()) {
          if (this.extractedTags.length > 8) {
            this.errorMessage = 'Too many tags'
            this.error = true
            return
          } else {
            formData.append('tags', JSON.stringify(this.extractedTags))
          }
        } else {
          this.errorMessage = 'Bad tag format'
          this.error = true
          return
        }
      }
      try {
        this.error = false
        this.uploadLoading = true
        let result = await PostService.upload(formData)
        this.uploadLoading = false
        this.show = false
        let postId = result.data._id
        this.$router.push({ name: 'postPage', params: { postId: postId } })
        this.$store.dispatch('setSnackbarText', 'Post uploaded successfully.')
      } catch (error) {
        this.errorMessage = error.response.data.error
        this.error = true
        this.uploadLoading = false
        return
      }
      this.image = null
      //  this.dialog = false
      this.title = null
    },
    extractAndVerifyTags () {
      this.extractedTags = []
      let separated = this.tags.split(',')
      separated = separated.map((tag) => {
        return tag.trim()
      })
      if (!separated) {
        return false
      }
      for (let tag of separated) {
        if (/^[a-zA-Z0-9_-]*$/g.test(tag)) {
          if (tag !== '') {
            this.extractedTags.push(tag)
          }
        } else {
          return false
        }
      }
      return true
    },
    onClose () {
      this.show = false
    }
  },
  components: {
    VueFullScreenFileDrop
  }
}
</script>

<style scoped>
  .uploadBox {
    border-style: solid;
    border-width: 2px;
    border-color: rgb(190, 190, 190);
    height: 300px;
  }
</style>
