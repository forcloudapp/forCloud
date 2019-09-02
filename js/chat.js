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

  if (data.child('message').val().includes("@" + await forCloud.getUsername())) {
    message.style.backgroundColor = "yellow"
  }
  $('chat-messages').insertBefore(message, $('chat-messages').firstChild)
})

async function chatNotification(data) {
  if (data.child('message').val().includes("@" + await forCloud.getUsername())) {
    if (Notification.permission === "granted") {
      var notification = new Notification(data.child('message').val(), {
        icon: "../images/favicon.ico"
      })
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          var notification = new Notification(data.child('message').val(), {
            icon: "../images/favicon.ico"
          })
        }
      });
    }
  }
}

firebase.database().ref('chat')
  .orderByChild('time')
  .startAt(Date.now())
  .on('child_added', snapshot => {
    chatNotification(snapshot)
  })