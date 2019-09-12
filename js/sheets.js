'use strict'

forCloud.sheets = {}

const formulaVariables = {}

{

    async function newTh(place) {
        let newTh = document.createElement('th');
        place.appendChild(newTh);
        newTh.innerHTML = ' ';
        forCloud.sheets.updateDeleteButton()
    }

    async function newRow() {
        let newTr = document.createElement('tr');
        $('sheets-editor').getElementsByTagName('tbody')[0].appendChild(newTr);
        for (let i = 0; i < $('sheets-editor').getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
            newTh(newTr);
        }
        forCloud.sheets.updateDeleteButton()
    }

    async function deleteRow(element) {
        let deleteItem = $('delete-row').cloneNode(true);
        $('delete-row').removeAttribute('disabled')
        $('delete-row').addEventListener('click', (event) => {
            element.remove()
            $('delete-row').parentNode.replaceChild(deleteItem, $('delete-row'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function insertRowAbove(element) {
        let insertRow = $('insert-row-above').cloneNode(true);
        $('insert-row-above').removeAttribute('disabled')
        $('insert-row-above').addEventListener('click', (event) => {
            let newTr = document.createElement('tr');
            $('sheets-editor').getElementsByTagName('tbody')[0].appendChild(newTr);
            for (let i = 0; i < $('sheets-editor').getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
                newTh(newTr);
            }
            element.parentNode.insertBefore(newTr, element)
            $('insert-row-above').parentNode.replaceChild(insertRow, $('insert-row-above'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function insertRowBelow(element) {
        let insertRow = $('insert-row-below').cloneNode(true);
        $('insert-row-below').removeAttribute('disabled')
        $('insert-row-below').addEventListener('click', (event) => {
            let newTr = document.createElement('tr');
            $('sheets-editor').getElementsByTagName('tbody')[0].appendChild(newTr);
            for (let i = 0; i < $('sheets-editor').getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByTagName('th').length; i++) {
                newTh(newTr);
            }
            element.parentNode.insertBefore(newTr, element.nextSibling)
            $('insert-row-below').parentNode.replaceChild(insertRow, $('insert-row-below'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function insertColumnLeft(elements) {
        let insertColumn = $('insert-column-left').cloneNode(true);
        $('insert-column-left').removeAttribute('disabled')
        $('insert-column-left').addEventListener('click', (event) => {
            elements.forEach(element => {
                let newCell = document.createElement('th');
                newCell.innerHTML = ' ';
                element.parentNode.insertBefore(newCell, element)
            });
            $('insert-column-left').parentNode.replaceChild(insertColumn, $('insert-column-left'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function insertColumnRight(elements) {
        let insertColumn = $('insert-column-right').cloneNode(true);
        $('insert-column-right').removeAttribute('disabled')
        $('insert-column-right').addEventListener('click', (event) => {
            elements.forEach(element => {
                let newCell = document.createElement('th');
                newCell.innerHTML = ' ';
                element.parentNode.insertBefore(newCell, element.nextSibling)
            });
            $('insert-column-right').parentNode.replaceChild(insertColumn, $('insert-column-right'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function deleteColumn(elements) {
        let deleteItem = $('delete-column').cloneNode(true);
        $('delete-column').removeAttribute('disabled')
        $('delete-column').addEventListener('click', (event) => {
            for (let i = 0; i < elements.length; i++) {
                elements[i].remove()
            }
            $('delete-column').parentNode.replaceChild(deleteItem, $('delete-column'));
            forCloud.sheets.updateDeleteButton()
        })
    }

    async function updateDeleteButton() {
        for (let i = 0; i < $('sheets-editor').getElementsByTagName('tr').length; i++) {
            $('sheets-editor').getElementsByTagName('tr')[i].onmousedown = () => {
                let deleteItem = $('delete-row').cloneNode(true);
                $('delete-row').parentNode.replaceChild(deleteItem, $('delete-row'))
                forCloud.sheets.deleteRow($('sheets-editor').getElementsByTagName('tr')[i])

                let insertRowAboveButton = $('insert-row-above').cloneNode(true);
                $('insert-row-above').parentNode.replaceChild(insertRowAboveButton, $('insert-row-above'))
                forCloud.sheets.insertRowAbove($('sheets-editor').getElementsByTagName('tr')[i])

                let insertRowBelowButton = $('insert-row-below').cloneNode(true);
                $('insert-row-below').parentNode.replaceChild(insertRowBelowButton, $('insert-row-below'))
                forCloud.sheets.insertRowBelow($('sheets-editor').getElementsByTagName('tr')[i])
            }
            $('sheets-editor').getElementsByTagName('tr')[i].onblur = () => {
                $('delete-row').setAttribute('disabled', '');
                $('insert-row-above').setAttribute('disabled', '');
                $('insert-row-below').setAttribute('disabled', '');
            }
        }
        for (let i = 0; i < $('sheets-editor').getElementsByTagName('th').length; i++) {
            $('sheets-editor').getElementsByTagName('th')[i].onmousedown = () => {
                let deleteItem = $('delete-cell').cloneNode(true);
                $('delete-cell').parentNode.replaceChild(deleteItem, $('delete-cell'));
                forCloud.sheets.deleteCell($('sheets-editor').getElementsByTagName('th')[i])
            }
            $('sheets-editor').getElementsByTagName('th')[i].onblur = () => {
                $('delete-cell').setAttribute('disabled', '');
                $('delete-column').setAttribute('disabled', '');
                $('insert-column-left').setAttribute('disabled', '');
                $('insert-column-right').setAttribute('disabled', '');

            }
        }
        for (let i = 0; i < $('sheets-editor').getElementsByTagName('tr').length; i++) {
            for (let j = 0; j < $('sheets-editor').getElementsByTagName('tr')[i].getElementsByTagName('th').length; j++) {
                $('sheets-editor').getElementsByTagName('tr')[i].getElementsByTagName('th')[j].onmouseup = () => {
                    let deleteItem = $('delete-column').cloneNode(true);
                    $('delete-column').parentNode.replaceChild(deleteItem, $('delete-column'));
                    let columnArray = []
                    let columnIndex = j;
                    for (let x = 0; x < $('sheets-editor').getElementsByTagName('tr').length; x++) {
                        columnArray.push($('sheets-editor').getElementsByTagName('tr')[x].getElementsByTagName('th')[columnIndex])
                    }
                    forCloud.sheets.deleteColumn(columnArray)

                    let insertColumnLeftButton = $('insert-column-left').cloneNode(true);
                    $('insert-column-left').parentNode.replaceChild(insertColumnLeftButton, $('insert-column-left'))
                    forCloud.sheets.insertColumnLeft(columnArray)

                    let insertColumnRightButton = $('insert-column-right').cloneNode(true);
                    $('insert-column-right').parentNode.replaceChild(insertColumnRightButton, $('insert-column-right'))
                    forCloud.sheets.insertColumnRight(columnArray)
                }
            }
        }
    }

    function updateCells () {
        for (const cell of $('sheets-editor').getElementsByTagName('th')) {
            formulaVariables[`${['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'][[...cell.parentElement.children].indexOf(cell)]}${[...cell.parentElement.parentElement.children].indexOf(cell.parentElement) + 1}`] = cell.textContent
        }

        for (const cell of $('sheets-editor').getElementsByTagName('th')) {
            if (cell.dataset.formula) {
                cell.textContent = math.evaluate(cell.dataset.formula, formulaVariables)
            }
        }
    }

    async function deleteCell(element) {
        let deleteItem = $('delete-cell').cloneNode(true);
        $('delete-cell').removeAttribute('disabled')
        $('delete-cell').addEventListener('click', (event) => {
            element.textContent = ''
            $('delete-cell').parentNode.replaceChild(deleteItem, $('delete-cell'));
        })
        forCloud.sheets.updateDeleteButton()
    }

    async function newColumn() {
        for (let i = 0; i < $('sheets-editor').getElementsByTagName('tr').length; i++) {
            newTh($('sheets-editor').getElementsByTagName('tbody')[0].getElementsByTagName('tr')[i]);
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
    forCloud.sheets.updateCells = updateCells
    forCloud.sheets.deleteCell = deleteCell
    forCloud.sheets.deleteColumn = deleteColumn
    forCloud.sheets.updateDeleteButton = updateDeleteButton
    forCloud.sheets.insertRowAbove = insertRowAbove
    forCloud.sheets.insertRowBelow = insertRowBelow
    forCloud.sheets.insertColumnLeft = insertColumnLeft
    forCloud.sheets.insertColumnRight = insertColumnRight
}

$('save-spreadsheet').addEventListener('click', async () => {
    forCloud.sheets.saveSpreadsheet()
})

$('add-row').addEventListener('click', async () => {
    forCloud.sheets.newRow()
})

$('add-column').addEventListener('click', async () => {
    forCloud.sheets.newColumn()
})

$('sheets-editor').addEventListener('input', async () => {
    forCloud.sheets.updateCells()
})

firebase.auth().onAuthStateChanged(() => {
    if (forCloud.getQueryVariable('file') !== false) {
        firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
            $('sheets-editor').innerHTML = forCloud.decrypt(snapshot.val())

            for (const cell of $('sheets-editor').getElementsByTagName('th')) {
                console.log(cell)
        
                cell.addEventListener('dblclick', async () => {
                    const formula = window.prompt('Formula', cell.dataset.formula ? cell.dataset.formula : '')
            
                    if (formula === '') {
                        if (confirm('Are you sure you want to delete this formula?')) {
                            delete cell.dataset.formula
                        }
                    } else if (formula) {
                        cell.dataset.formula = formula
                        forCloud.sheets.updateCells()
                    }
                })
            }

            forCloud.sheets.updateDeleteButton()

            $('spreadsheet-name-label').style.display = 'none'
        })
    } else {
        forCloud.sheets.updateDeleteButton()

        for (const cell of $('sheets-editor').getElementsByTagName('th')) {
            console.log(cell)
    
            cell.addEventListener('dblclick', async () => {
                const formula = window.prompt('Formula', cell.dataset.formula ? cell.dataset.formula : '')
        
                if (formula === '') {
                    if (confirm('Are you sure you want to delete this formula?')) {
                        delete cell.dataset.formula
                    }
                } else if (formula) {
                    cell.dataset.formula = formula
                    forCloud.sheets.updateCells()
                }
            })
        }
    }

    forCloud.sheets.updateCells()
})