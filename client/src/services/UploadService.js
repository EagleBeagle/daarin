import Api from '@/services/Api'

export default {
  upload (formData) {
    console.log('uploadService: ' + formData.get('image'))
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
