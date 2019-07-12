'use strict'

forCloud.docs = {}

function getQueryVariable (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] == variable) {
        return pair[1];
      }
    }
  return false;
}

{
    async function createFile (name, content, path, type) {
        firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('type').set(type)
        return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('content').set(content)
    }

    async function saveDocument () {
        if (getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('document-editor').innerHTML))
        } else {
            createFile($('document-name').value, forCloud.encrypt($('document-editor').innerHTML), '/', 'document').then(() => {
              location.assign('../files/index.html')
            })
        }
    }

    forCloud.docs.saveDocument = saveDocument
    forCloud.docs.createFile = createFile
}

$('save-document').addEventListener('click', () => {
    forCloud.docs.saveDocument()
})

firebase.auth().onAuthStateChanged(() => {
    if (getQueryVariable('file') !== false) {
        firebase.database().ref(decodeURI(getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
            $('document-editor').innerHTML = forCloud.decrypt(snapshot.val())
            $('document-name-label').style.display = 'none'
            $('document-editor-label').style.display = 'none'
        })
    }
})
  