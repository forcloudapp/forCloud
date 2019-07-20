'use strict'

forCloud.sheets = {}

{
    async function newTh(place) {
        let newTh = document.createElement('th');
        place.appendChild(newTh);
        newTh.innerHTML = ' ';
        forCloud.sheets.updateDeleteButton()
    }

    async function newRow() {
        let newTr = document.createElement('tr');
        $("sheets-editor").getElementsByTagName("tbody")[0].appendChild(newTr);
        for (let i = 0; i < $("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
            newTh(newTr);
        }
        forCloud.sheets.updateDeleteButton()
    }

    async function deleteRow(element) {
        let deleteItem = $('delete-row').cloneNode(true);
        $('delete-row').disabled = false
        $('delete-row').addEventListener('click', (event) => {
            element.remove()
            $('delete-row').parentNode.replaceChild(deleteItem, $('delete-row'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function deleteColumn(elements) {
        let deleteItem = $('delete-column').cloneNode(true);
        $('delete-column').disabled = false
        $('delete-column').addEventListener('click', (event) => {
            for (let i = 0; i < elements.length; i++) {
                elements[i].remove()
            }
            $('delete-column').parentNode.replaceChild(deleteItem, $('delete-column'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function updateDeleteButton () {
        for (let i = 0; i < $("sheets-editor").getElementsByTagName('tr').length; i++) {
            $("sheets-editor").getElementsByTagName('tr')[i].onmousedown = () => {
                let deleteItem = $('delete-row').cloneNode(true);
                $('delete-row').parentNode.replaceChild(deleteItem, $('delete-row'))
                forCloud.sheets.deleteRow($("sheets-editor").getElementsByTagName('tr')[i])
            }
            $("sheets-editor").getElementsByTagName('tr')[i].onblur = () => {
                $('delete-row').disabled = true
            }
        }
        for (let i = 0; i < $("sheets-editor").getElementsByTagName('th').length; i++) {
            $("sheets-editor").getElementsByTagName('th')[i].onmousedown = () => {
                let deleteItem = $('delete-cell').cloneNode(true);
                $('delete-cell').parentNode.replaceChild(deleteItem, $('delete-cell'));
                forCloud.sheets.deleteCell($("sheets-editor").getElementsByTagName('th')[i])
            }
            $("sheets-editor").getElementsByTagName('th')[i].onblur = () => {
                $('delete-cell').disabled = true
                $('delete-column').disabled = true
            }
        }
        for (let i = 0; i < $("sheets-editor").getElementsByTagName('tr').length; i++) {
            for (let j = 0; j < $("sheets-editor").getElementsByTagName('tr')[i].getElementsByTagName('th').length; j++) {
                $("sheets-editor").getElementsByTagName('tr')[i].getElementsByTagName('th')[j].onmouseup = () => {
                    let deleteItem = $('delete-column').cloneNode(true);
                    $('delete-column').parentNode.replaceChild(deleteItem, $('delete-column'));
                    let columnArray = []
                    let rowIndex = j;
                    for (let x = 0; x < $("sheets-editor").getElementsByTagName('tr').length; x++) {
                        columnArray.push($("sheets-editor").getElementsByTagName('tr')[x].getElementsByTagName('th')[rowIndex])
                    }
                    forCloud.sheets.deleteColumn(columnArray) 

                }
            }
        }
    }

    async function deleteCell(element) {
        let deleteItem = $('delete-cell').cloneNode(true);
        $('delete-cell').disabled = false
        $('delete-cell').addEventListener('click', (event) => {
            element.textContent = ""
            $('delete-cell').parentNode.replaceChild(deleteItem, $('delete-cell'));
        })
        forCloud.sheets.updateDeleteButton()
    }

    async function newColumn() {
        for (let i = 0; i < $("sheets-editor").getElementsByTagName('tr').length; i++) {
            newTh($("sheets-editor").getElementsByTagName("tbody")[0].getElementsByTagName('tr')[i]);
        }
        forCloud.sheets.updateDeleteButton()
    }

    async function saveSpreadsheet() {
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
    forCloud.sheets.deleteRow = deleteRow
    forCloud.sheets.deleteCell = deleteCell
    forCloud.sheets.deleteColumn = deleteColumn
    forCloud.sheets.updateDeleteButton = updateDeleteButton
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
            forCloud.sheets.updateDeleteButton()
            $('spreadsheet-name-label').style.display = 'none'
        })
    } else {
        forCloud.sheets.updateDeleteButton()
    }
})
