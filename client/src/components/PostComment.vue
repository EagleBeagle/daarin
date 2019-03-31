<template>
  <v-container align-center pt-2 pb-0 px-0>
    <v-layout justify-center row wrap>
      <v-flex xs1 align-self-center mr-3>
        <v-img id="avatar" width="50px" height="50px" src="http://res.cloudinary.com/daarin/image/upload/v1553966054/kkrlwpyyo9zhtfr8tgsf.jpg"></v-img>
      </v-flex>
      <v-flex xs9 align-self-start text-xs-left px-0>
        <span class="title pl-3 pb-1">kutyamutya</span>
        <span class="grey--text">•</span>
        <span class="grey--text">1 hour ago</span>
        <v-layout row wrap>
          <v-flex xs11>
            <div
              id="commentBody"
              class="body-1 light-blue accent-3 white--text pa-2 pl-3 ma-0">
              ex soluta, veritatis possimus aliquid laudantium. veritatis possimus aliquid laudantium. Perspiciatis, dolor.
            </div>
          </v-flex>
          <v-flex xs1 align-self-center>
            <span class="title pl-4 ml-0">1</span>
          </v-flex>
          <v-layout>
            <v-flex xs9>
              <v-btn
                class="ma-0"
                small
                flat
                fab
                @click="upvote()">
                <v-icon class="grey--text" small>arrow_upward</v-icon>
              </v-btn>
              <v-btn
                class="ma-0"
                small
                flat
                fab
                @click="downvote()">
                <v-icon class="grey--text" small>arrow_downward</v-icon>
              </v-btn>
            </v-flex>
            <v-flex align-self-center xs3>
              <span class="grey--text">see 3 replies</span>
            </v-flex>
            <v-flex xs3>
              <v-btn
                class="ma-0"
                small
                fab
                flat>
                <v-icon class="grey--text" small>reply</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-flex>
    </v-layout>
    <v-divider class="ma-0 p-0"/>
  </v-container>

</template>

<script>

</script>

<style scoped>
#avatar {
  border-radius: 20px;
}

#commentBody {
  border-radius: 30px;
}
</style>
