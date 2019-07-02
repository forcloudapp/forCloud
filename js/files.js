'use strict'

const storageRef = firebase.storage().ref();
forCloud.files = {}

{

  function backFromFolder(path) {
    let splitPath = path.split('/')
    splitPath.pop()
    splitPath.pop()
    if (splitPath.length < 1) {
      $('folder-back').style.display = 'none';
      forCloud.files.render('/')
    } else {
      forCloud.files.render(splitPath.join('/'))
      let backButton = $('folder-back').cloneNode(true);
      $('folder-back').parentNode.replaceChild(backButton, $('folder-back'));
      backButton.addEventListener('click', (event) => {
        forCloud.files.backFromFolder(splitPath.join('/'))
      })
    }
  }

  function moveFile(path, file) {
    forCloud.files.createFile(file.key, file.val().content, path, file.val().type)
    forCloud.files.deleteFile('/' + file.ref.path.toString(), file)
  }

  function moveFolder(path, file, folderName, filePath) {
    if (typeof file.val().files !== 'undefined') {
      firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(folderName).set({
        folder: true,
        files: file.val().files
      })
    } else {
      firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(folderName).set({
        folder: true,
      })
    }
    forCloud.files.deleteFile('/' + filePath)
  }

  async function deleteFile(path, file) {
    let deleteRef = firebase.database().ref().child(path)
    deleteRef.remove()
    if (file.val().type === 'file') {
      storageRef.child(file.val().content).delete()
    }
    forCloud.files.render('/')
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
    forCloud.files.createFile(name, file.val().content, filePath.toString().split(',').join('/'), file.val().type)
    forCloud.files.deleteFile('/' + path)
    forCloud.files.render('/')
  }

  async function renameFolder(file, path) {
    let pathArray = path.split('/')
    pathArray.pop()
    let name = prompt('Enter a new name')
    if (typeof file.val().files !== 'undefined') {
      firebase.database().ref().child(pathArray.join('/')).child(name).set({
        folder: true,
        files: file.val().files
      })
    } else {
      firebase.database().ref().child(pathArray.join('/')).child(name).set({
        folder: true,
      })
    }
    forCloud.files.deleteFile('/' + path)
    forCloud.files.render('/')
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
        const filePath = file.ref.path.toString()
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
        const deleteButton = document.createElement('div')
        deleteButton.classList.add('mdl-card_actions')
        deleteButton.classList.add('mdl-card--border')
        const deleteButtonAction = document.createElement('a')
        deleteButtonAction.classList.add('mdl-button')
        deleteButtonAction.classList.add('mdl-button--colored')
        deleteButtonAction.classList.add('mdl-js-button')
        deleteButtonAction.classList.add('mdl-js-ripple-effect')
        deleteButtonAction.addEventListener('click', (event) => {
          forCloud.files.deleteFile(filePath, file)
        })
        deleteButtonAction.textContent = 'Delete'
        deleteButton.appendChild(deleteButtonAction)
        const renameButtonAction = document.createElement('a')
        renameButtonAction.classList.add('mdl-button')
        renameButtonAction.classList.add('mdl-button--colored')
        renameButtonAction.classList.add('mdl-js-button')
        renameButtonAction.classList.add('mdl-js-ripple-effect')
        renameButtonAction.addEventListener('click', (event) => {
          if (!file.val().folder) {
            forCloud.files.renameFile(file, filePath)
          } else {
            forCloud.files.renameFolder(file, filePath)
          }
        })
        renameButtonAction.textContent = 'Rename'
        deleteButton.appendChild(renameButtonAction)
        const moveButtonAction = document.createElement('a')
        moveButtonAction.classList.add('mdl-button')
        moveButtonAction.classList.add('mdl-button--colored')
        moveButtonAction.classList.add('mdl-js-button')
        moveButtonAction.classList.add('mdl-js-ripple-effect')
        moveButtonAction.addEventListener('click', (event) => {
          forCloud.files.renderMove('/', file, filePath)
        })
        moveButtonAction.textContent = 'Move'
        deleteButton.appendChild(moveButtonAction)
        deleteButtonAction.textContent = 'Delete'
        deleteButton.appendChild(deleteButtonAction)
        if (file.val().folder) {
          const folderPath = file.ref_.path.pieces_.splice(3).join('/')

          titleContainer.addEventListener('click', () => {
            render(folderPath)
            $('folder-back').style.display = 'block'
            let backButton = $('folder-back').cloneNode(true);
            $('folder-back').parentNode.replaceChild(backButton, $('folder-back'));
            backButton.addEventListener('click', (event) => {
              forCloud.files.backFromFolder(folderPath)
            })
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

  async function searchRender() {
    if ($('files-search').value == '') {
      return forCloud.files.render('/')
    }
    $('files').innerHTML = ''

    let reference = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files')

    reference.on('value', value => {
      if (value.val().folder) {
        reference = reference.child('files')
      }
    })

    reference.on('value', value => {
      value.forEach(file => {
        if (file.key.toLowerCase().includes($('files-search').value.toLowerCase())) {
          const filePath = file.ref.path.toString()
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
          if (file.val().folder) {
            const folderPath = file.ref_.path.pieces_.splice(3).join('/')

            titleContainer.addEventListener('click', () => {
              render(folderPath)
              $('folder-back').addEventListener('click', (event) => {
                forCloud.files.backFromFolder(folder)
              })
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
          $('files').appendChild(card)
        }
      })
    })
  }

  function renderMove(path, fileToMove, fileToMovePath) {
    let fileToMoveSplit = fileToMovePath.split('/')
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
        if (file.val().folder && (file.ref.path.toString() !== fileToMovePath)) {
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
            if (fileToMoveSplit[fileToMoveSplit.length - 3] !== folderTitle) {
              if (!fileToMove.val().folder) {
                forCloud.files.moveFile(value.ref_.path.pieces_.splice(3).join('/') + '/' + folderTitle + '/files/', fileToMove)
              } else {
                forCloud.files.moveFolder(value.ref_.path.pieces_.splice(3).join('/') + '/' + folderTitle + '/files/', fileToMove, fileToMoveSplit[fileToMoveSplit.length - 1], fileToMovePath)
              }
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
              renderMove(folderPath, fileToMove, fileToMovePath)
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
  forCloud.files.searchRender = searchRender
  forCloud.files.renderMove = renderMove
  forCloud.files.deleteFile = deleteFile
  forCloud.files.renameFile = renameFile
  forCloud.files.uploadFile = uploadFile
  forCloud.files.moveFile = moveFile
  forCloud.files.moveFolder = moveFolder
  forCloud.files.renameFolder = renameFolder
  forCloud.files.backFromFolder = backFromFolder
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.render('/')
})

$('close-file-move').addEventListener('click', (event) => {
  $('move-file-div').style.display = 'none'
  $('files').style.display = 'block'
})

$('files-search').addEventListener('keydown', (event) => {
  forCloud.files.searchRender()
})