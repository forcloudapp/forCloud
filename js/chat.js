'use strict'

$('chatbox').addEventListener('keydown', async event => {
  if (event.keyCode === 13) {
    firebase.database().ref('chat').push({
      message: $('chatbox').value,
      time: Date.now(),
      user: await forCloud.getUsername()
    })

    $('chatbox').value = ''
  }
})

firebase.database().ref('chat').on('child_added', async data => {
  const message = document.createElement('p')

  message.textContent = `[${forCloud.convertTime(data.child('time').val())}] ${data.child('user').val()}: ${data.child('message').val()}`

  $('chat-messages').insertBefore(message, $('chat-messages').firstChild)
})
