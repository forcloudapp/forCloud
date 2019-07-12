'use strict'

$('sign-up').addEventListener('click', (event) => {
  if (typeof $('username').value !== 'undefined' && typeof $('password').value !== 'undefined') {
    firebase.auth().createUserWithEmailAndPassword($('username').value + '@forcloud.app', $('password').value).catch(function (error) {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: error.code
      })
    }).then(() => {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Sign up successful! Welcome to forCloud'
      })
      location.assign('../chat/index.html')
    });
  }
})