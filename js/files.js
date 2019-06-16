'use strict'

const storageRef = firebase.storage().ref();
forCloud.files = {}

{

  function moveFile(path, file) {
    forCloud.files.createFile(file.key, file.val().content, path, file.val().type)
    forCloud.files.deleteFile('/' + file.ref_.path.pieces_.toString().split(',').join('/'))
  }

  async function deleteFile(path, file) {
    let deleteRef = firebase.database().ref().child(path)
    deleteRef.remove()
    if (file.val().type === 'file') {
      storageRef.child(file.val().content).delete()
    }
    forCloud.files.render()
  }

  function uploadFile() {
    forCloud.selectFile().then((fileList) => {
      const file = fileList[0]
      const fileName = file.name.replace(/[^\w\s]/gi, '')
      const fileRef = storageRef.child(firebase.auth().currentUser.uid).child(fileName)
      const filePath = firebase.auth().currentUser.uid + '/' + fileName
      fileRef.put(file).then((snapshot) => {
        createFile(fileName, filePath, '/', 'file')
      })
    })
  }

  async function renameFile(file, path) {
    let name = prompt('Enter a new name')
    let filePath = file.ref_.path.pieces_
    filePath = filePath.slice(3)
    filePath.pop()
    if (filePath.length < 1) {
      filePath = ['/']
    }
    if (file.val().folder !== true) {
      createFile(name, file.val().content, filePath.toString().split(',').join('/'), file.val().type)
      forCloud.files.deleteFile('/' + file.ref_.path.pieces_.toString().split(',').join('/'))
    }
    forCloud.files.render(filePath.toString().split(',').join('/'))
  }

  async function createFile(name, content, path, type) {
    firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('type').set(type)
    return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('content').set(content)
  }

  async function createFolder(name, path) {
    return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).set({ folder: true })
  }

  async function render(path) {
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
        deleteButtonAction.addEventListener('click', (event) => {
          event.preventDefault()
          forCloud.files.deleteFile(file.ref_.path.pieces_.toString().split(',').join('/'), file)
        })
        deleteButtonAction.textContent = 'Delete'
        deleteButton.appendChild(deleteButtonAction)
        if (!file.val().folder) {
          const renameButtonAction = document.createElement('a')
          renameButtonAction.classList.add('mdl-button')
          renameButtonAction.classList.add('mdl-button--colored')
          renameButtonAction.classList.add('mdl-js-button')
          renameButtonAction.classList.add('mdl-js-ripple-effect')
          renameButtonAction.addEventListener('click', (event) => {
            event.preventDefault()
            forCloud.files.renameFile(file, file.ref_.path.pieces_.toString().split(',').join('/'))
          })
          renameButtonAction.textContent = 'Rename'
          deleteButton.appendChild(renameButtonAction)

          const moveButtonAction = document.createElement('a')
          moveButtonAction.classList.add('mdl-button')
          moveButtonAction.classList.add('mdl-button--colored')
          moveButtonAction.classList.add('mdl-js-button')
          moveButtonAction.classList.add('mdl-js-ripple-effect')
          moveButtonAction.addEventListener('click', (event) => {
            forCloud.files.renderMove('/', file)
          })
          moveButtonAction.textContent = 'Move File'
          deleteButton.appendChild(moveButtonAction)
        }
        deleteButtonAction.textContent = 'Delete'
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
            } else if (file.val().type === 'file') {
              storageRef.child(file.val().content).getDownloadURL().then(url => {
                window.open(url)
              })
            }
          })

        }

        titleContainer.appendChild(title)
        card.appendChild(titleContainer)
        if (file.val().type === 'document') {
          card.appendChild(forCloud.createIcon('edit', '50px'))
        } else if (file.val().type === 'spreadsheet') {
          card.appendChild(forCloud.createIcon('table_chart', '50px'))
        } else if (file.val().folder) {
          card.appendChild(forCloud.createIcon('folder', '50px'))
        } else if (file.val().type === 'file') {
          card.appendChild(forCloud.createIcon('description', '50px'))
        }
        card.appendChild(deleteButton)
        $('files').appendChild(card)
      })
    })
  }

  function renderMove(path, fileToMove) {
    $('move-file-div').style.display = 'block'
    $('files').style.display = 'none'
    $('move-file').innerHTML = ''

    let reference = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path)

    reference.on('value', value => {
      if (value.val().folder) {
        reference = reference.child('files')
      }
    })

    reference.on('value', value => {
      value.forEach(file => {
          if (file.val().folder) {
          const card = document.createElement('div')

          card.classList.add('mdl-card')
          card.classList.add('mdl-shadow--2dp')
          card.style.display = 'inline-block'

          const titleContainer = document.createElement('div')

          titleContainer.classList.add('mdl-card__title')
          titleContainer.classList.add('mdl-card--expand')

          const title = document.createElement('h4')
          title.textContent = file.key
          const folderTitle = file.key
          const moveButtonDiv = document.createElement('div')
          moveButtonDiv.classList.add('mdl-card_actions')
          moveButtonDiv.classList.add('mdl-card--border')
          const moveButtonAction = document.createElement('a')
          moveButtonAction.classList.add('mdl-button')
          moveButtonAction.classList.add('mdl-button--colored')
          moveButtonAction.classList.add('mdl-js-button')
          moveButtonAction.classList.add('mdl-js-ripple-effect')
          moveButtonAction.addEventListener('click', (event) => {
            if (fileToMove.ref_.path.pieces_[fileToMove.ref_.path.pieces_.length - 3] !== folderTitle) {
              forCloud.files.moveFile(value.ref_.path.pieces_.splice(3).join('/') + '/' + folderTitle + '/files/', fileToMove)
            }
          })
          moveButtonAction.textContent = 'Move File'
          moveButtonDiv.appendChild(moveButtonAction)
          titleContainer.appendChild(title)
          card.appendChild(titleContainer)
          card.appendChild(moveButtonDiv)
          if (file.val().folder) {
            const folderPath = file.ref_.path.pieces_.splice(3).join('/')

            card.addEventListener('click', () => {
              renderMove(folderPath, fileToMove)
            })
          }
          $('move-file').appendChild(card)
        }
      })
    })
  }

  forCloud.files.createFile = createFile
  forCloud.files.createFolder = createFolder
  forCloud.files.render = render
  forCloud.files.renderMove = renderMove
  forCloud.files.deleteFile = deleteFile
  forCloud.files.renameFile = renameFile
  forCloud.files.uploadFile = uploadFile
  forCloud.files.moveFile = moveFile
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.render('/')
})

$('close-file-move').addEventListener('click', (event) => {
  $('move-file-div').style.display = 'none'
  $('files').style.display = 'block'
})