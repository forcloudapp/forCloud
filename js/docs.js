'use strict'

forCloud.docs = {}

{

    async function saveDocument () {
        if (forCloud.getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('key').on('value', (snapshot) => {
                firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('document-editor').innerHTML, snapshot.val()))
            })
        } else {
            let newKey = forCloud.uuid()
            forCloud.files.createFile($('document-name').value, forCloud.encrypt($('document-editor').innerHTML, newKey), '/', 'document', newKey).then(() => {
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
        firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).on('value', (snapshot) => {
            $('document-editor').innerHTML = forCloud.decrypt(snapshot.child('content').val(), snapshot.child('key').val())
            $('document-name-label').style.display = 'none'
        })
    }
})
  