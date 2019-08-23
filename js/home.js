'use strict'

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    location.replace('../sign-in/index.html')
  } else {
    $('signed-in-as').textContent = `Signed in as ${forCloud.parseEmail(user.email)}`
    $('signed-in-as-side').textContent = `Signed in as ${forCloud.parseEmail(user.email)}`
  }
})
