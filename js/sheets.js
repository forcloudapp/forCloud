'use strict'

forCloud.sheets = {}

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
    async function newTh (place) {
        let newTh = document.createElement('th');
        place.appendChild(newTh);
        newTh.innerHTML = 'Value';
      }
      
    async function newRow () {
        let newTr = document.createElement('tr');
        $("sheets-editor").getElementsByTagName("tbody")[0].appendChild(newTr);
        for (var i = 0; i < $("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
          newTh(newTr);
        }
      }
      
    async function newColumn () {
        for (var i = 0; i < $("sheets-editor").getElementsByTagName('tr').length; i++) {
          newTh($("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[i]);
        }
    }


    async function createFile (name, content, path, type) {
        firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('type').set(type)
        return firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files').child(path).child(name).child('content').set(content)
    }

    async function saveSpreadsheet () {
        if (getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('sheets-editor').innerHTML))
        } else {
            createFile($('spreadsheet-name').value, forCloud.encrypt($('sheets-editor').innerHTML), '/', 'spreadsheet').then(() => {
              location.assign('../files/index.html')
            })
        }
    }

    forCloud.sheets.saveSpreadsheet = saveSpreadsheet
    forCloud.sheets.createFile = createFile
    forCloud.sheets.newTh = newTh
    forCloud.sheets.newColumn = newColumn
    forCloud.sheets.newRow = newRow

}

$('save-spreadsheet').addEventListener('click', () => {
    forCloud.sheets.saveSpreadsheet()
})

$('add-row').addEventListener('click', () => {
    forCloud.sheets.newRow()
})

$('add-column').addEventListener('click', () => {
    forCloud.sheets.newColumn()
})

firebase.auth().onAuthStateChanged(() => {
    if (getQueryVariable('file') !== false) {
        firebase.database().ref(decodeURI(getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
            $('sheets-editor').innerHTML = forCloud.decrypt(snapshot.val())
            $('spreadsheet-name-label').style.display = 'none'
        })
    }
})
  