<template>
  <v-layout justify-center>
    <v-flex xs4>
      <div v-for="post in posts" :key="post.id">
        <v-flex class="pb-5">
          <v-card>
            <!-- <v-card-title>
              <h1>{{ post.title }}</h1>
              <v-spacer></v-spacer>
              <p>{{ post.createdBy.username }}</p><br>
              <p>asdasdsa</p>
              
            </v-card-title> -->
            <div class="pt-2">
              <h1 class="bold blue--text">{{ post.title }}</h1>
              <p class="light-blue--text">{{ post.createdBy.username }}</p>
            </div>
            <v-divider></v-divider>
            <v-img :src="post.content" width="100%"/>
            <v-card-title>
              <div>
                <span class="light-blue--text">{{ post.description }}</span>
              </div>
            </v-card-title>
          </v-card>
        </v-flex>
      </div>
    </v-flex>
  </v-layout>
</template>

<script>
import PostService from '@/services/PostService'
export default {
  data () {
    return {
      posts: null
    }
  },
  async mounted () {
    this.posts = (await PostService.index()).data
  },
  methods: {
    write () {
      console.log(this.posts)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
