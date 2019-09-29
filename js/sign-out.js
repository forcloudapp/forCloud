'use strict'

forCloud.signOut().then(() => {
  localStorage.removeItem('forCloudStorage_key')
  location.replace('../sign-in/index.html')
})