'use strict'

// Event listeners.

$('sign-in').addEventListener('click', () => {
  forCloud.signIn($('username').value, $('password').value).then(() => {
    location.assign('../chat/index.html')
  }).catch(error => {
    if (error.code == 'auth/wrong-password' || error.code == 'auth/user-not-found') {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Username or password incorrect'
      })
    }
  })
})