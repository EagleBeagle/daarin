<template>
  <v-container class="pageHeader">
    <v-toolbar fixed class="light-blue accent-2 pageHeader" flat dark>
      <v-toolbar-items>
        <v-btn
          v-if="$store.state.isUserLoggedIn"
          flat
          fab
          class="px-0 ma-0 hidden-sm-and-down"
          @click="openUploadDialog">
          <v-icon>fas fa-file-upload</v-icon>
        </v-btn> <!-- ezt itt átmegoldani -->
        <v-btn
          v-else
          flat
          fab
          class="px-0 ma-0"
          v-on:click.stop="authDialog = true">
          <v-icon>fas fa-file-upload</v-icon>
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-title dark class="mr-4">
        <router-link
          flat
          class="font-weight-light display-2"
          :to="{ name: 'home' }"
          :style="{ cursor: 'pointer' }"
          tag="span">
          daarin
          </router-link>
      </v-toolbar-title>
      <v-divider vertical/>
      <v-toolbar-items>
        <v-btn
          v-if="user"
          flat
          @click="$router.push('/recommended')">
          RECOMMENDED
        </v-btn>
        <v-btn
          v-if="user"
          flat>
          TRENDING
        </v-btn>
        <v-btn
          v-if="user"
          flat>
          NEWEST
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-flex align-self-center mr-3 hidden-sm-and-down>
          <v-text-field
            prepend-inner-icon="fas fa-search mr-2"
            clearable
            single-line
            color="light-blue"
            :label="searchLabel"
            solo
            light
            flat
            hide-details
            v-model="searchText"
            v-on:keyup.enter="search">
          </v-text-field>
        </v-flex>
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
          v-if="!isUserLoggedIn"
          flat
          dark
          :to="{
            name: 'register'
          }">
          Sign Up
        </v-btn>
        <v-flex v-if="isUserLoggedIn" align-self-center>
          <v-btn
            flat
            fab
            @click="$router.push({ name: 'userPage', params: { userId: user._id } })">
            <v-avatar
              size="45">
              <v-img v-if="user.avatar" id="avatar" :src="user.avatar"></v-img>
              <v-icon large v-else>fas fa-user-circle</v-icon>
            </v-avatar>
          </v-btn>
        </v-flex>
        <v-flex v-if="isUserLoggedIn && user.admin" align-self-center>
          <v-btn
            flat
            fab
            @click="$router.push({ name: 'adminPage' })">
            <v-icon>fas fa-user-shield</v-icon>
          </v-btn>
        </v-flex>
        <v-btn
          v-if="isUserLoggedIn"
          flat
          fab
          dark
          @click="logout">
          <v-icon>fas fa-sign-out-alt</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <UploadDialog v-model="dialog"/>
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
import UploadDialog from './UploadDialog'
import {mapState} from 'vuex'
export default {
  data () {
    return {
      dialog: null,
      authDialog: null,
      searchText: null,
      searchLabel: 'Search'
    }
  },
  computed: {
    ...mapState([
      'isUserLoggedIn',
      'user',
      'closeComments'
    ])
  },
  watch: {
    $route (to) {
      if (to.name !== 'search') {
        this.searchLabel = 'Search'
      } else {
        this.searchLabel = 'Results for "' + to.query.query + '"'
      }
      this.searchText = null
    }
  },
  methods: {
    async logout () {
      this.$store.dispatch('setToken', null)
      this.$store.dispatch('setUser', null)
      await this.$store.dispatch('updateEventSource')
      this.$router.push({
        name: 'home'
      })
    },
    openUploadDialog () {
      if (this.user && this.user.confirmed) {
        this.dialog = true
      } else if (!this.user.confirmed) {
        this.$store.dispatch('setSnackbarText', 'Confirm your email to upload posts.')
      }
    },
    search () {
      // this.$store.dispatch('search', this.searchText)
      if (this.searchText) {
        this.$router.push({
          name: 'search',
          query: {
            query: this.searchText
          }
        })
      }
    }
  },
  components: {
    UploadDialog
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
.pageHeader {
  z-index: 999;
}
</style>
