import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuetify from 'vuetify'
import { SilenceVuetifyWarn } from '../helpers/SilenceWarnings'
import Post from '@/components/AppPost'

describe('AppPost.vue', () => {
  let cmp
  let postProp = {
    post: {
      _id: 'testPostId',
      title: 'testTitle',
      createdBy: {
        username: 'testUser'
      },
      likes: ['testlike1', 'testlike2', 'testlike3'],
      dislikes: ['testdislike1', 'testdislike2'],
      url: 'www.test.com'
    }
  }
  let storeMock = {
    $store: {
      state: {
        isUserLoggedIn: false,
        user: {
          _id: 'testUserId'
        }
      }
    }
  }

  const silenceVuetifyWarn = new SilenceVuetifyWarn()

  beforeEach(() => {
    silenceVuetifyWarn.enable()
    
    const localVue = createLocalVue()
    localVue.use(Vuetify)
    cmp = shallowMount(Post, {
      localVue: localVue,
      propsData: postProp,
      mocks: storeMock
    })
    silenceVuetifyWarn.disable()
  })

  it('should render the post', () => {
    expect(true).to.equal(true)
  })

  it('should render the title of the post correctly', () => {
    expect(cmp.find('h1').text()).to.equal(postProp.post.title)
  })

  it('should render the creator of the post correctly', () => {
    expect(cmp.find('p').text()).to.equal(postProp.post.createdBy.username)
  })

  it('should render the image of the post correctly', () => {
    expect(cmp.find('v-img-stub').attributes('src')).to.equal(postProp.post.url)
  })

  it('should render the points of the post correctly', () => {
    expect(cmp.find('h3').text()).to.equal('' + (postProp.post.likes.length - postProp.post.dislikes.length))
  })
})
