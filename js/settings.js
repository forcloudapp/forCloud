$('change-password-button').addEventListener('click', (event) => {
  if ($('password-change').value == $('password-change-confirm').value) {
    firebase.auth().currentUser.updatePassword($('password-change').value).then(function () {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Password changed succesfully'
      })
    }).catch(function (error) {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: error.code
      })
    });
  } else {
    alert('Passwords do not match!  Please double-check that you have entered the right passwords')
  }
})
