'use strict'

forCloud.docs = {}

{

    async function saveDocument () {
        if (forCloud.getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('document-editor').innerHTML))
        } else {
            forCloud.files.createFile($('document-name').value, forCloud.encrypt($('document-editor').innerHTML), '/', 'document').then(() => {
              location.assign('../files/index.html')
            })
        }
    }

    forCloud.docs.saveDocument = saveDocument
}

$('save-document').addEventListener('click', () => {
    forCloud.docs.saveDocument()
})

firebase.auth().onAuthStateChanged(() => {
    if (forCloud.getQueryVariable('file') !== false) {
        firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
            $('document-editor').innerHTML = forCloud.decrypt(snapshot.val())
            $('document-name-label').style.display = 'none'
        })
    }
})
  