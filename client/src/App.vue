<template>
  <v-app>
    <div id="app">
      <PageHeader />
      <!-- <img src="./assets/logo.png"> -->
      <router-view/>
    </div>
  </v-app>
</template>

<script>
import PageHeader from '@/components/PageHeader.vue'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
document.title = 'daarin'
export default {
  name: 'App',
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
  margin-top: 60px;
  background-color:#ECEFF1;
}

.input-group--text-field input {
  border-bottom: 1px solid black;
}

.v-btn__content {
  color: white;
}

</style>
