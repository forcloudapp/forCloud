'use strict'

$('sign-up').addEventListener('click', async (event) => {
  if (typeof $('username').value !== 'undefined' && typeof $('password').value !== 'undefined') {
    let terms = confirm('By using our site, you agree that you take full responsibility for your data.  We are not responsible for any and all loss of data, or any damages caused to (or by) your data.  We reserve the right to ban any user at any time at our discretion (resulting in loss of data).')
    if (terms) {
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
          firebase.database().ref('/keys').child($('username').value.toLowerCase()).set(publicKey)
          firebase.database().ref('/users').child(userId).child('privateKey').set(forCloud.encrypt(privateKey, $('password').value))
          location.assign('../chat/index.html')
        })
        $('snackbar').MaterialSnackbar.showSnackbar({
          message: 'Sign up successful! Welcome to forCloud'
        })
      });
    }
  }
})