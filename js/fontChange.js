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

if ($('size-selector') !== null) {
  $('size-selector').addEventListener('change', (event) => {
    let sel = window.getSelection();
    if (sel.rangeCount) {
      let container = document.createElement('div');
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        container.appendChild(sel.getRangeAt(i).cloneContents());
      }
      selectedHtml = container.innerHTML;
    }
    let html = `<div style="font-size: ${$('size-selector').value}px; line-height: 1em;">${selectedHtml.replace(/font-size/g, "font-size-old")}</div>`
    document.execCommand('insertHTML', false, html);
  })
}

$('change-color').addEventListener('click', (event) => {
  document.execCommand("styleWithCSS", false, true);
  forCloud.pickColor().then((color) => {
    document.execCommand("foreColor", false, color);
  })
})

if ($('insertImage') !== null) {
  $('insertImage').addEventListener('click', (event) => {
    let imageUrl = prompt('Image URL')
    if (imageUrl !== null) {
      let imageHtml = `<img src="${imageUrl}">`
      document.execCommand('insertHTML', false, imageHtml);
    }
  })
}