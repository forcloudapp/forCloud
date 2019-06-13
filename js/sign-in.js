'use strict'

// Event listeners.

$('sign-in').addEventListener('click', () => {
  forCloud.signIn($('username').value, $('password').value).then(() => {
    location.assign('../chat/index.html')
  }).catch(error => {
    $('snackbar').MaterialSnackbar.showSnackbar({
      message: error.code
    })
  })
})