import Api from '@/services/Api'

export default {
  index () {
    return Api().get('/home')
  },
  upload (formData) {
    console.log('uploadService: ' + formData.get('createdBy'))
    return Api().post('upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(function () {
      console.log('SUCCESS')
    }).catch(function () {
      console.log('FAILURE')
    })
  }
}
