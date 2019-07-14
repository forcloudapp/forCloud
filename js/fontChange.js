$('font-selector').addEventListener('change', (event) => {
  let sel = window.getSelection(); 
  if (sel.rangeCount) {
    let container = document.createElement('div');
    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
      container.appendChild(sel.getRangeAt(i).cloneContents());
    }
    selectedHtml = container.innerHTML;
  }
  let html = `<div style="font-family: ${$('font-selector').value};">${selectedHtml.replace(/font-family/g, "font-family-old")}</div>`
  document.execCommand('insertHTML', false, html);
})

function insertImage () {
  let imageUrl = prompt('Image URL')
  let imageHtml = `<img src="${imageUrl}">`
  document.execCommand('insertHTML', false, imageHtml);
}