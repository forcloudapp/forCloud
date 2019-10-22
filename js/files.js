'use strict'

const storageRef = firebase.storage().ref();

{

  let sharedCurrently;

  function backFromFolder(path) {
    let folderPath = path.split('/')
    folderPath.pop()
    let splitPath = path.split('/')
    splitPath.pop()
    splitPath.pop()
    if (splitPath.length < 1) {
      $('folder-back').style.display = 'none';
      forCloud.files.render('/')
      updateNewFolderButton('/')
    } else {
      forCloud.files.render(splitPath.join('/'))
      let backButton = $('folder-back').cloneNode(true);
      $('folder-back').parentNode.replaceChild(backButton, $('folder-back'));
      backButton.addEventListener('click', (event) => {
        forCloud.files.backFromFolder(splitPath.join('/'))
      })
      updateNewFolderButton(folderPath)
    }
  }

  function moveFile(path, file) {
    forCloud.files.currentFileContext.child(path).child('keys').on('value', (snapshot) => {
      if (typeof snapshot !== "undefined") {
        forCloud.files.createFile(file.val().title, file.val().content, path, file.val().type, file.val().keys, file.val().users ? file.val().users : undefined)
      } else {
        forCloud.files.createFile(file.val().title, file.val().content, path, file.val().type, file.val().users ? file.val().users : undefined)
      }
    })
    forCloud.files.deleteFile('/' + file.ref.path.toString(), file)
    forCloud.files.render('/')
  }

  async function switchFileContext(fileContext) {
    forCloud.files.currentFileContext = fileContext
    forCloud.files.render('/')
  }


  function shareFile(file, path) {
    let users = prompt('Users to share with (seperate with ,)').split(",")
    if (file.val().users) {
      users.forEach(user => {
        firebase.database().ref('shared-files').child('shared').child('files').child(path).child('users').child(user).set('true')
        if (typeof file.val().keys !== "undefined") {
          users.forEach(function (user) {
            forCloud.getUsername().then((userName) => {
              let decryptedKey = forCloud.decryptPrivate(file.val().keys[userName])
              forCloud.encryptPublic(decryptedKey, user).then((result) => {
                firebase.database().ref('shared-files').child('shared').child('files').child(path).child('keys').child(user.toLowerCase()).set(result)
              })
            })
          })
        }
      })
    } else {
      let usersObject = {}
      for (const user of users) {
        usersObject[user] = "true"
      }
      let encryptionKeys = file.val().keys
      let userName = forCloud.parseEmail(firebase.auth().currentUser.email)
      let usersLoop = new Promise((resolve, reject) => {
        users.forEach(async (user) => {
          let decryptedKey = forCloud.decryptPrivate(file.val().keys[userName])
          forCloud.encryptPublic(decryptedKey, user).then((result) => {
            encryptionKeys[user] = result
            users.splice(users.indexOf(user), 1)
            if (users.length < 1) {
              resolve(encryptionKeys)
            }
          })
        })
      })
      usersLoop.then((encryptionKeys) => {
        const fileObject = {
          'title': file.val().title,
          'content': file.val().content,
          'keys': encryptionKeys,
          'type': file.val().type,
          'users': usersObject
        }

        if (!fileObject.keys) {
          delete fileObject.keys
        }

        if (!fileObject.users) {
          delete fileObject.users
        }

        firebase.database().ref('shared-files').child('shared').child('files').push(fileObject)
        forCloud.files.deleteFile('/' + file.ref.path.toString(), file)
        forCloud.files.render('/')
      })
    }
  }

  function shareFolder(file, path, filePath, folderName) {
    let users = prompt('Users to share with (seperate with ,)').split(",")
    if (file.val().users) {
      users.forEach(user => {
        firebase.database().ref('shared-files').child('shared').child('files').child(path).child('users').child(user).set('true')
      })
    } else {
      let usersObject = {}
      for (const user of users) {
        usersObject[user] = 'true'
      }
      let folderObject = {
        title: folderName,
        folder: true,
        files: file.val().files,
        users: usersObject
      }

      if (!file.val().files) {
        delete folderObject.files
      }
      firebase.database().ref('shared-files').child('shared').child('files').child(path).set(folderObject)
      forCloud.files.deleteFile('/' + filePath)
    }
  }

  function moveFolder(path, file, folderName, filePath) {
    if (typeof file.val().users !== 'undefined') {
      if (typeof file.val().files !== 'undefined') {
        forCloud.files.currentFileContext.child(path).push({
          folder: true,
          title: folderName,
          files: file.val().files,
          users: file.val().users
        })
      } else {
        forCloud.files.currentFileContext.child(path).push({
          folder: true,
          title: folderName,
          users: file.val().users
        })
      }
    } else {
      if (typeof file.val().files !== 'undefined') {
        forCloud.files.currentFileContext.child(path).push({
          folder: true,
          title: folderName,
          files: file.val().files
        })
      } else {
        forCloud.files.currentFileContext.child(path).push({
          folder: true,
          title: folderName
        })
      }
    }

    forCloud.files.deleteFile('/' + filePath)
  }

  async function deleteFile(path, file) {
    let deleteRef = firebase.database().ref().child(path)
    deleteRef.remove()
    forCloud.files.render('/')
  }

  async function deleteFileButton(path, file) {
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
      let uploadTask = fileRef.put(file)
      uploadTask.on('state_changed', function (snapshot) {
        $('files-upload-bar').style.display = 'block'
        $('files-upload-bar').MaterialProgress.setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      }, function (error) {
        console.log(error)
        $('files-upload-bar').style.display = 'none'
      }, function () {
        forCloud.files.createFile(fileName, filePath, '/', 'file')
        forCloud.files.render('/')
        $('files-upload-bar').style.display = 'none'
      });
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
    forCloud.files.currentFileContext.child(filePath.join('/')).child(file.key).child('title').set(name)
    forCloud.files.render('/')
  }

  async function renameFolder(file, path) {
    let name = prompt('Enter a new name')
    firebase.database().ref(path).child('title').set(name)
    forCloud.files.render('/')
  }

  async function createFolder(name, path) {
    return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).push({ folder: true, title: name })
  }

  async function render(path) {
    $('files').innerHTML = ''

    let reference;

    if (forCloud.files.sharedCurrently && path == '/') {
      reference = forCloud.files.currentFileContext.child(path).orderByChild('users/' + await forCloud.getUsername()).equalTo('true')
    } else {
      reference = forCloud.files.currentFileContext.child(path)
    }

    reference.on('value', value => {
      if (value.exists()) {
        if (value.val().folder) {
          reference = reference.child('files')
        }
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
        title.textContent = file.val().title
        const deleteButton = document.createElement('div')
        deleteButton.classList.add('mdl-card_actions')
        deleteButton.classList.add('mdl-card--border')
        const deleteButtonAction = document.createElement('a')
        deleteButtonAction.classList.add('mdl-button')
        deleteButtonAction.classList.add('mdl-button--colored')
        deleteButtonAction.classList.add('mdl-js-button')
        deleteButtonAction.classList.add('mdl-js-ripple-effect')
        deleteButtonAction.addEventListener('click', (event) => {
          forCloud.files.deleteFileButton(filePath, file)
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

        const shareButtonAction = document.createElement('a')
        shareButtonAction.classList.add('mdl-button')
        shareButtonAction.classList.add('mdl-button--colored')
        shareButtonAction.classList.add('mdl-js-button')
        shareButtonAction.classList.add('mdl-js-ripple-effect')
        shareButtonAction.addEventListener('click', (event) => {
          if (!file.val().folder) {
            forCloud.files.shareFile(file, filePath.split('/').splice(4).join('/'))
          } else {
            forCloud.files.shareFolder(file, filePath.split('/').splice(4).join('/'), filePath, file.val().title)
          }
        })
        shareButtonAction.textContent = 'Share'
        deleteButton.appendChild(shareButtonAction)
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
            updateNewFolderButton(folderPath + '/files/')
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
            } else if (file.val().type === 'slideshow') {
              location.assign('../slides/index.html?file=' + encodeURI(file.ref_.path.pieces_))
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
        } else if (file.val().type === 'slideshow') {
          card.appendChild(forCloud.createIcon('slideshow', '50px'))
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

    let reference = forCloud.files.currentFileContext

    if (forCloud.files.sharedCurrently) {
      reference = forCloud.files.currentFileContext.orderByChild('users/' + await forCloud.getUsername()).equalTo('true')
    } else {
      reference = forCloud.files.currentFileContext
    }


    reference.on('value', value => {
      if (value.exists()) {
        if (value.val().folder) {
          reference = reference.child('files')
        }
      }
    })

    reference.on('value', value => {
      value.forEach(file => {
        if (file.val().title.toLowerCase().includes($('files-search').value.toLowerCase())) {
          const filePath = file.ref.path.toString()
          const card = document.createElement('div')

          card.classList.add('mdl-card')
          card.classList.add('mdl-shadow--2dp')
          card.style.display = 'inline-block'

          const titleContainer = document.createElement('div')

          titleContainer.classList.add('mdl-card__title')
          titleContainer.classList.add('mdl-card--expand')

          const title = document.createElement('h4')
          title.textContent = file.val().title
          if (file.val().folder) {
            const folderPath = file.ref_.path.pieces_.splice(3).join('/')

            titleContainer.addEventListener('click', () => {
              render(folderPath)
              $('folder-back').addEventListener('click', (event) => {
                forCloud.files.backFromFolder(folderPath)
              })
              updateNewFolderButton(folderPath + '/files/')
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
              } else if (file.val().type === 'slideshow') {
                location.assign('../slides/index.html?file=' + encodeURI(file.ref_.path.pieces_))
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
          } else if (file.val().type === 'slideshow') {
            card.appendChild(forCloud.createIcon('slideshow', '50px'))
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

    if (path == '') {
      path = '/'
    }

    let reference;

    if (forCloud.files.sharedCurrently && path == '/') {
      reference = forCloud.files.currentFileContext.child(path).orderByChild('users/' + forCloud.parseEmail(firebase.auth().currentUser.email)).equalTo('true')
    } else {
      reference = forCloud.files.currentFileContext.child(path)
    }

    reference.on('value', value => {
      if (value.exists()) {
        if (value.val().folder) {
          reference = reference.child('files')
        }
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
          const folderKey = file.key
          title.textContent = file.val().title
          const moveButtonDiv = document.createElement('div')
          moveButtonDiv.classList.add('mdl-card_actions')
          moveButtonDiv.classList.add('mdl-card--border')
          const moveButtonAction = document.createElement('a')
          moveButtonAction.classList.add('mdl-button')
          moveButtonAction.classList.add('mdl-button--colored')
          moveButtonAction.classList.add('mdl-js-button')
          moveButtonAction.classList.add('mdl-js-ripple-effect')
          moveButtonAction.addEventListener('click', (event) => {
            if (fileToMoveSplit[fileToMoveSplit.length - 3] !== file.val().title) {
              if (!fileToMove.val().folder) {
                forCloud.files.moveFile(value.ref_.path.pieces_.splice(3).join('/') + '/' + folderKey + '/files/', fileToMove)
              } else {
                forCloud.files.moveFolder(value.ref_.path.pieces_.splice(3).join('/') + '/' + folderKey + '/files/', fileToMove, fileToMove.val().title, fileToMovePath)
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

  function updateNewFolderButton(path) {
    let newFolderButton = $('new_folder').cloneNode(true)
    $('new_folder').parentNode.replaceChild(newFolderButton, $('new_folder'));
    $('new_folder').addEventListener('click', (event) => {
      forCloud.files.createFolder(prompt('Name your new folder'), path)
    })
  }

  forCloud.files.createFolder = createFolder
  forCloud.files.shareFile = shareFile
  forCloud.files.shareFolder = shareFolder
  forCloud.files.render = render
  forCloud.files.searchRender = searchRender
  forCloud.files.renderMove = renderMove
  forCloud.files.deleteFile = deleteFile
  forCloud.files.deleteFileButton = deleteFileButton
  forCloud.files.renameFile = renameFile
  forCloud.files.uploadFile = uploadFile
  forCloud.files.moveFile = moveFile
  forCloud.files.moveFolder = moveFolder
  forCloud.files.renameFolder = renameFolder
  forCloud.files.backFromFolder = backFromFolder
  forCloud.files.switchFileContext = switchFileContext
  forCloud.files.updateNewFolderButton = updateNewFolderButton
  forCloud.files.sharedCurrently = sharedCurrently
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.currentFileContext = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files')
  forCloud.files.render('/')
  $('upload_file_button').addEventListener('click', (event) => {
    forCloud.files.uploadFile()
  })
})

$('close-file-move').addEventListener('click', (event) => {
  $('move-file-div').style.display = 'none'
  $('files').style.display = 'block'
})

$('files-search').addEventListener('keydown', (event) => {
  forCloud.files.searchRender()
})

$('my-files-button').addEventListener('click', (event) => {
  forCloud.files.sharedCurrently = false
  forCloud.files.switchFileContext(firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files'))
})

$('shared-files-button').addEventListener('click', async (event) => {
  forCloud.files.sharedCurrently = true
  forCloud.files.switchFileContext(firebase.database().ref('shared-files').child('shared').child('files'))
})

forCloud.files.updateNewFolderButton('/')