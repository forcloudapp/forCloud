'use strict'

forCloud.docs = {}

{

    async function saveDocument() {
        if (forCloud.getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('keys').on('value', (snapshot) => {
                forCloud.getUsername().then((userName) => {
                    let documentKey = forCloud.decryptPrivate(snapshot.child(userName).val())
                    firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('document-editor').innerHTML, documentKey))
                })
            })
        } else {
            forCloud.getUsername().then((userName) => {
                let keys = {}
                let newKey = forCloud.uuid()
                forCloud.encryptPublic(newKey, userName).then((result) => {
                    keys[userName] = result
                    forCloud.files.createFile($('document-name').value, forCloud.encrypt($('document-editor').innerHTML, newKey), '/', 'document', keys).then(() => {
                        location.assign('../files/index.html')
                    })
                })
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
            forCloud.getUserid().then((userId) => {
                forCloud.getUsername().then((userName) => {
                    let key = snapshot.child('keys').child(userName).val()
                    $('document-editor').innerHTML = forCloud.decrypt(snapshot.child('content').val(), forCloud.decryptPrivate(key))
                })
                $('document-name-label').style.display = 'none'
            })
        })
    }
})
