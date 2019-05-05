<template>
  <v-app>
    <div id="app">
        <v-snackbar
        v-model="showSnackbar"
        bottom right
        color="#FFFFFF"
        class="light-blue--text"
        style="text-align: center"
        >
        {{ snackbarText }}
      </v-snackbar>
      <PageHeader />
      <!-- <img src="./assets/logo.png"> -->
      <transition name="page" mode="out-in">
        <router-view/>
      </transition>
    </div>
  </v-app>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import {mapState} from 'vuex'
document.title = 'daarin'
export default {
  name: 'App',
  data () {
    return {
      showSnackbar: false,
      snackbarText: null
    }
  },
  computed: {
    ...mapState([
      'requestSnackbar'
    ])
  },
  watch: {
    requestSnackbar () {
      this.snackbarText = this.$store.state.snackbarText
      this.showSnackbar = true
    }
  },
  components: {
    PageHeader
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  background-color:#ECEFF1;
}

body {
  background-color:#ECEFF1;
}
body::-webkit-scrollbar {display:none;}

.input-group--text-field input {
  border-bottom: 1px solid black;
}

.v-btn__content {
  color: white;
}

.page-enter-active, .page-leave-active {
  transition: opacity 200ms, transform 200ms;
}
.page-enter, .page-leave-to {
  opacity: 0;
}

</style>
