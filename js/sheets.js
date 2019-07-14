'use strict'

forCloud.sheets = {}

{
    async function newTh (place) {
        let newTh = document.createElement('th');
        place.appendChild(newTh);
        newTh.innerHTML = 'Value';
      }
      
    async function newRow () {
        let newTr = document.createElement('tr');
        $("sheets-editor").getElementsByTagName("tbody")[0].appendChild(newTr);
        for (let i = 0; i < $("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
          newTh(newTr);
        }
      }
      
    async function newColumn () {
        for (let i = 0; i < $("sheets-editor").getElementsByTagName('tr').length; i++) {
          newTh($("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[i]);
        }
    }

    async function saveSpreadsheet () {
        if (forCloud.getQueryVariable('file') !== false) {
            firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt($('sheets-editor').innerHTML))
        } else {
            forCloud.files.createFile($('spreadsheet-name').value, forCloud.encrypt($('sheets-editor').innerHTML), '/', 'spreadsheet').then(() => {
              location.assign('../files/index.html')
            })
        }
    }

    forCloud.sheets.saveSpreadsheet = saveSpreadsheet
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
    if (forCloud.getQueryVariable('file') !== false) {
        firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
            $('sheets-editor').innerHTML = forCloud.decrypt(snapshot.val())
            $('spreadsheet-name-label').style.display = 'none'
        })
    }
})
  