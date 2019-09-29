'use strict'

$('sign-up').addEventListener('click', async (event) => {
  if (typeof $('username').value !== 'undefined' && typeof $('password').value !== 'undefined') {
    firebase.auth().createUserWithEmailAndPassword($('username').value + '@forcloud.app', $('password').value).catch(function (error) {
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: error.code
      })
    }).then(() => {
      let keys = new JSEncrypt()
      let publicKey = keys.getPublicKeyB64()
      let privateKey = keys.getPrivateKeyB64()
      forCloud.store('key', privateKey)
      forCloud.getUserid().then((userId) => {
        alert(userId)
        firebase.database().ref('/keys').child($('username').value).set(publicKey)
        firebase.database().ref('/users').child(userId).child('privateKey').set(forCloud.encrypt(privateKey, $('password').value))
        location.assign('../chat/index.html')
      })
      $('snackbar').MaterialSnackbar.showSnackbar({
        message: 'Sign up successful! Welcome to forCloud'
      })
    });
  }
})