'use strict'

// Event listeners.

$('sign-in').addEventListener('click', async () => {
  forCloud.signIn($('username').value, $('password').value).then(() => {
    let password = $('password').value
    forCloud.getUserid().then((userId) => {
      firebase.database().ref('/users').child(userId).child('privateKey').on('value', (snapshot) => {
        if (snapshot.val()) {
          forCloud.store('key', forCloud.decrypt(snapshot.val(), password))
          location.assign('../chat/index.html')
        } else {
          let keys = new JSEncrypt()
          let publicKey = keys.getPublicKeyB64()
          let privateKey = keys.getPrivateKeyB64()
          forCloud.store('key', privateKey)
          forCloud.getUsername().then((userName) => {
            firebase.database().ref('/keys').child(userName).set(publicKey)
            firebase.database().ref('/users').child(userId).child('privateKey').set(forCloud.encrypt(privateKey, $('password').value))
            location.assign('../chat/index.html')
          })
        }
      })
    })
  }).catch(error => {
    if (error.code == 'auth/wrong-password' || error.code == 'auth/user-not-found') {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Username or password incorrect'
      })
    }
  })
})