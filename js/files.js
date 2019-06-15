'use strict'

forCloud.files = {}

{

  async function deleteFile (path) {
    let deleteRef = firebase.database().ref().child(path)
    deleteRef.remove()
    forCloud.files.render()
  }

  async function renameFile (file, path) {
    let name = prompt("Enter a new name")
    let filePath = file.ref_.path.pieces_
    filePath = filePath.slice(3)
    filePath.pop()
    if (filePath.length < 1) {
      filePath = ["/"]
    }
    if (file.val().folder !== true) {
      createFile(name, file.val().content, filePath.toString().split(",").join("/"), file.val().type)
      forCloud.files.deleteFile('/' + file.ref_.path.pieces_.toString().split(",").join("/"))
    } 
    forCloud.files.render(filePath.toString().split(",").join("/"))
  }

  async function createFile (name, content, path, type) {
    firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('type').set(type)
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
        card.style.display = 'inline-block'

        const titleContainer = document.createElement('div')

        titleContainer.classList.add('mdl-card__title')
        titleContainer.classList.add('mdl-card--expand')

        const title = document.createElement('h4')

        title.textContent = file.key

        const deleteButton = document.createElement('div')
        deleteButton.classList.add('mdl-card_actions')
        deleteButton.classList.add('mdl-card--border')
        const deleteButtonAction = document.createElement('a')
        deleteButtonAction.classList.add('mdl-button')
        deleteButtonAction.classList.add('mdl-button--colored')
        deleteButtonAction.classList.add('mdl-js-button')
        deleteButtonAction.classList.add('mdl-js-ripple-effect')
        deleteButtonAction.addEventListener("click", (event) => {
          event.preventDefault()
          forCloud.files.deleteFile(file.ref_.path.pieces_.toString().split(",").join("/"))
        })
        deleteButtonAction.textContent = "Delete"
        deleteButton.appendChild(deleteButtonAction)
        if (!file.val().folder) {
          const renameButtonAction = document.createElement('a')
          renameButtonAction.classList.add('mdl-button')
          renameButtonAction.classList.add('mdl-button--colored')
          renameButtonAction.classList.add('mdl-js-button')
          renameButtonAction.classList.add('mdl-js-ripple-effect')
          renameButtonAction.addEventListener("click", (event) => {
            event.preventDefault()
            forCloud.files.renameFile(file, file.ref_.path.pieces_.toString().split(",").join("/"))
          })
          renameButtonAction.textContent = "Rename"
          deleteButton.appendChild(renameButtonAction)
        }
        deleteButtonAction.textContent = "Delete"
        deleteButton.appendChild(deleteButtonAction)
        if (file.val().folder) {
          const folderPath = file.ref_.path.pieces_.splice(3).join('/')

          titleContainer.addEventListener('click', () => {
            render(folderPath)
          })
        } else {
          titleContainer.addEventListener('click', () => {
            if (file.val().type === 'document') {
              location.assign('../docs/index.html?file=' + encodeURI(file.ref_.path.pieces_))
            } else if (file.val().type === 'spreadsheet') {
              location.assign('../sheets/index.html?file=' + encodeURI(file.ref_.path.pieces_))
            }
          })
          
        }

        titleContainer.appendChild(title)
        card.appendChild(titleContainer)
        card.appendChild(deleteButton)

        $('files').appendChild(card)
      })
    })
  }
  
  forCloud.files.createFile = createFile
  forCloud.files.createFolder = createFolder
  forCloud.files.render = render
  forCloud.files.deleteFile = deleteFile
  forCloud.files.renameFile = renameFile
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.render('/')
})
