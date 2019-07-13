$('font-selector').addEventListener('change', (event) => {
  var sel = window.getSelection();
  if (sel.rangeCount) {
    var e = document.createElement('span');
    e.style = 'font-family:' + $('font-selector').value + ';';
    e.innerHTML = sel.toString();

    var range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(e);
  }
})