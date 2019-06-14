'use strict'

forCloud.files = {}

{
  async function createFile (name, content, path) {
    return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('content').set(content)
  }

  async function createFolder (name, path) {
    return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).set({folder: true})
  }

  async function render (path) {
    $('files').innerHTML = ''
    
    let reference = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path)
    
    reference.on('value', value => {
      if (value.val().folder) {
        reference = reference.child('files')
      }
    })

    reference.on('value', value => {
      value.forEach(file => {
        const card = document.createElement('div')

        card.classList.add('mdl-card')
        card.classList.add('mdl-shadow--2dp')
        card.style.display = "inline-block"

        const titleContainer = document.createElement('div')

        titleContainer.classList.add('mdl-card__title')
        titleContainer.classList.add('mdl-card--expand')

        const title = document.createElement('h4')

        title.textContent = file.key

        if (file.val().folder) {
          const folderPath = file.ref_.path.pieces_.splice(3).join('/')

          card.addEventListener('click', () => {
            render(folderPath)
          })
        }

        titleContainer.appendChild(title)
        card.appendChild(titleContainer)

        $('files').appendChild(card)
      })
    })
  }
  
  forCloud.files.createFile = createFile
  forCloud.files.createFolder = createFolder
  forCloud.files.render = render
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.render('/')
})
