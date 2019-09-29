$('change-password-button').addEventListener('click', async (event) => {
  if ($('password-change').value == $('password-change-confirm').value) {
    firebase.auth().currentUser.updatePassword($('password-change').value).then(function () {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Password changed succesfully'
      })
      forCloud.getUserid().then((userId) => {
          firebase.database().ref('/users').child(userId).child('privateKey').set(forCloud.encrypt(forCloud.get('key'), $('password-change').value))
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
