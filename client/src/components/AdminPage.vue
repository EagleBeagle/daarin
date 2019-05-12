<template>
  <v-container pt-1>
    <v-layout justify-center v-if="loading" pt-5 mt-5>
      <div class="mt-5 pt-5">
        <v-progress-circular
          class="mr-3"
          indeterminate
          color="light-blue accent-2">
        </v-progress-circular>
      </div>
    </v-layout>
    <transition name="fade">
      <v-layout v-if="posts && users && comments && !loading" justify-space-around row wrap>
        <v-flex xs6>
          <v-container pt-3 mt-0>
            <v-layout justify-center row wrap>
              <v-flex align-self-center xs12>
                <span class="display-3 font-weight-bold">Administration</span>
              </v-flex>
              <v-flex mt-5>
                <div>
                  <span class="headline">Number of Members: </span>
                  <span class="headline light-blue--text font-weight-bold">{{ users.length }}</span>
                </div>
                <div>
                  <span class="headline">Currently Online: </span>
                  <span class="headline light-blue--text font-weight-bold">{{ currentlyOnline }}</span>
                </div>
                <div class="pt-5">
                  <span class="headline">Number of Posts: </span>
                  <span class="headline light-blue--text font-weight-bold">{{ posts.length }}</span>
                </div>
              </v-flex>
            </v-layout>
          </v-container>
        </v-flex>
        <v-flex xs6 align-self-top pl-4 pb-3 style="min-height: 420px">
          <v-card>
            <v-card-title class="font-weight-bold py-0 my-0">
              Members
              <v-spacer></v-spacer>
              <v-text-field
                v-model="userSearch"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="userHeaders"
              :items="users"
              :search="userSearch"
              must-sort
            >
              <template v-slot:items="props">
                <td
                  @click="$router.push({ name: 'userPage', params: { userId: props.item._id } })"
                  class="blue--text"
                  style="cursor: pointer">
                  {{ props.item.username }}
                </td>
                <td class="text-xs-right">{{ props.item.email }}</td>
                <td class="text-xs-right">{{ props.item.reportCount }}</td>
                <td class="text-xs-right" v-if="props.item.confirmed"><v-icon small>fas fa-check</v-icon></td>
                <td class="text-xs-right" v-else><v-icon small>fas fa-times</v-icon></td>
                <td class="text-xs-right" v-if="props.item.admin"><v-icon small>fas fa-check</v-icon></td>
                <td class="text-xs-right" v-else><v-icon small>fas fa-times</v-icon></td>
                <td>
                  <span v-if="props.item._id !== user._id">
                    <v-icon small style="cursor: pointer" v-if="props.item.admin" @click="setAdminRights(props.item)">fas fa-user-minus</v-icon>
                    <v-icon small style="cursor: pointer" v-else @click="setAdminRights(props.item)">fas fa-user-plus</v-icon>
                    <v-icon small style="cursor: pointer" class="ml-1" @click="deleteUser(props.item._id)">fas fa-trash</v-icon>
                  </span>
                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
        <v-flex xs6 align-self-top>
          <v-card>
            <v-card-title class="font-weight-bold py-0 my-0">
              Posts
              <v-spacer></v-spacer>
              <v-text-field
                v-model="postSearch"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="postHeaders"
              :items="posts"
              :search="postSearch"
              must-sort
            >
              <template v-slot:items="props">
                <td
                  @click="$router.push({ name: 'postPage', params: { postId: props.item._id } })"
                  class="blue--text"
                  style="cursor: pointer">
                  {{ props.item._id }}
                </td>
                <td class="text-xs-right">{{ props.item.title }}</td>
                <td class="text-xs-right">{{ props.item.createdBy.username }}</td>
                <td class="text-xs-right" v-if="props.item.reports">{{ props.item.reports.length }}</td>
                <td class="text-xs-right" v-else>0</td>
                <td class="text-xs-right">{{ new Date(props.item.createdAt).toLocaleString() }}</td>
                <td>
                  <v-icon small style="cursor: pointer" @click="deletePost(props.item._id)">fas fa-trash</v-icon>
                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
        <v-flex xs6 align-self-top pl-4>
          <v-card>
            <v-card-title class="font-weight-bold py-0 my-0">
              Comments
              <v-spacer></v-spacer>
              <v-text-field
                v-model="commentSearch"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              ></v-text-field>
            </v-card-title>
            <v-data-table
              :headers="commentHeaders"
              :items="comments"
              :search="commentSearch"
              must-sort
            >
              <template v-slot:items="props">
                <td
                  @click="$router.push({ name: 'userPage', params: { userId: props.item.createdBy._id } })"
                  class="blue--text"
                  style="cursor: pointer">
                  {{ props.item.createdBy.username }}
                </td>
                <td
                  @click="$router.push({ name: 'postPage', params: { postId: props.item.to } })"
                  class="blue--text"
                  style="cursor: pointer">
                  {{ props.item.to }}
                </td>
                <td class="text-xs-right">{{ props.item.text }}</td>
                <td class="text-xs-right" v-if="props.item.reports">{{ props.item.reports.length }}</td>
                <td class="text-xs-right" v-else>0</td>
                <td class="text-xs-right">{{ new Date(props.item.createdAt).toLocaleString() }}</td>
                <td>
                  <v-icon small style="cursor: pointer" @click="deleteComment(props.item._id)">fas fa-trash</v-icon>
                </td>
              </template>
            </v-data-table>
          </v-card>
        </v-flex>
      </v-layout>
    </transition>
  </v-container>
</template>

<script>
import PostService from '@/services/PostService'
import UserService from '@/services/UserService'
import CommentService from '@/services/CommentService'
import {mapState} from 'vuex'
export default {
  data () {
    return {
      postSearch: '',
      userSearch: '',
      commentSearch: '',
      postHeaders: [
        {
          text: 'ID',
          align: 'left',
          sortable: false,
          value: '_id'
        },
        { text: 'Title', value: 'title' },
        { text: 'Creator', value: 'creator' },
        { text: 'Reports', value: 'reports' },
        { text: 'Date Created', value: 'createdAt' },
        { text: 'Delete', value: 'Delete' }
      ],
      userHeaders: [
        {
          text: 'Username',
          align: 'left',
          value: 'username'
        },
        { text: 'Email', value: 'email' },
        { text: 'Report Count', value: 'reportCount' },
        { text: 'Confirmed', value: 'confirmed' },
        { text: 'Admin', value: 'admin' },
        { text: 'Options', value: 'Options' }
      ],
      commentHeaders: [
        {
          text: 'Creator',
          align: 'left',
          value: 'createdBy'
        },
        { text: 'Post', value: 'to' },
        { text: 'Text', value: 'text' },
        { text: 'Reports', value: 'reports' },
        { text: 'Date Created', value: 'createdAt' },
        { text: 'Delete', value: 'Delete' }
      ],
      posts: null,
      users: null,
      comments: null,
      currentlyOnline: null,
      loading: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  async mounted () {
    this.loading = true
    await this.getPosts()
    await this.getUsers()
    await this.getComments()
    this.loading = false
  },
  methods: {
    async getPosts () {
      try {
        let result = (await PostService.getPostsAdmin()).data
        this.posts = result
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error has occured while fetching posts.')
      }
    },
    async getUsers () {
      try {
        let result = (await UserService.getUsersAdmin()).data
        this.users = result.users
        this.currentlyOnline = result.active
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error has occured while fetching users.')
      }
    },
    async getComments () {
      try {
        let result = (await CommentService.getCommentsAdmin()).data
        this.comments = result
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error has occured while fetching comments.')
      }
    },
    async deletePost (postId) {
      try {
        await PostService.delete(postId)
        this.posts = this.posts.filter(post => post._id !== postId)
        this.$store.dispatch('setSnackbarText', 'Post deleted succesfully.')
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error occured during deletion.')
      }
    },
    async deleteUser (userId) {
      try {
        await UserService.delete(userId)
        this.users = this.users.filter(user => user._id !== userId)
        this.$store.dispatch('setSnackbarText', 'User deleted succesfully.')
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error occured during deletion.')
      }
    },
    async deleteComment (commentId) {
      try {
        await CommentService.delete(commentId)
        this.comments = this.comments.filter(comment => comment._id !== commentId)
        this.$store.dispatch('setSnackbarText', 'Comment deleted succesfully.')
      } catch (err) {
        this.$store.dispatch('setSnackbarText', 'An error occured during deletion.')
      }
    },
    async setAdminRights (user) {
      try {
        if (!user.admin) {
          await UserService.setAsAdmin(user._id)
          this.users = this.users.map(currentUser => {
            if (currentUser._id === user._id) {
              currentUser.admin = true
              return currentUser
            } else {
              return currentUser
            }
          })
          this.$store.dispatch('setSnackbarText', user.username + ' is now an admin.')
        } else {
          await UserService.unsetAdmin(user._id)
          this.users = this.users.map(currentUser => {
            if (currentUser._id === user._id) {
              currentUser.admin = false
              return currentUser
            } else {
              return currentUser
            }
          })
          this.$store.dispatch('setSnackbarText', user.username + ' is not an admin anymore.')
        }
      } catch (err) {
        this.$store.dispatch('setSnackbarText', err.response.data.error)
      }
    }
  }
}
</script>

<style scoped>
.v-btn .v-btn__content .v-icon {
  color: gray;
}
</style>
