'use strict'

forCloud.docs = {}

{
    async function createFile (name, content, path) {
        return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('content').set(content)
    }

    async function saveDocument () {
        createFile($('document-name').value, $('document-editor').value, '/')
    }

    forCloud.docs.saveDocument = saveDocument
    forCloud.docs.createFile = createFile
}

$('save-document').addEventListener('click', () => {
    forCloud.docs.saveDocument()
})