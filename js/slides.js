'use strict'

forCloud.slides = {}

let slideContainer = $('slide')
let current_slide = 0
let slide = $('slide')
let slideshow = ["<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"]


{

  function stopDrag() {
    document.onmousemove = null
    document.onmouseup = null
    forCloud.slides.savePosition()

  }

  function dragElement(element, dragX, dragY) {
    var e = e || window.event
    if (e.clientX > 0 && e.clientY > 0) {
      element.style.left = (e.clientX + dragX) + 'px'
      element.style.top = (e.clientY + dragY) + 'px'
    }
  }

  function beginDrag(element) {
    var e = e || window.event
    let dragX = element.offsetLeft - e.clientX
    let dragY = element.offsetTop - e.clientY
    document.onmousemove = function () {
      dragElement(element, dragX, dragY)
    }
    document.onmouseup = stopDrag
  }

  function addHeader() {
    let text = document.createElement('span')
    text.innerHTML = 'New Header'
    text.contentEditable = 'true'
    text.classList.add("edit-slides")
    text.classList.add("draggable-slides")
    text.style = 'position: absolute margin: 0px; font-size: 48px; line-height: 1;'
    text.onmousedown = () => {
      beginDrag(text)
      deleteItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
    }
    slideContainer.appendChild(text)
    forCloud.slides.savePosition()
  }

  function addSubtitle() {
    let text = document.createElement('span')
    text.innerHTML = 'New Subtitle'
    text.contentEditable = 'true'
    text.classList.add("edit-slides")
    text.classList.add("draggable-slides")
    text.style = 'position: absolute margin: 0px color: gray; font-size: 24px; line-height: 1;'
    text.onmousedown = function () {
      beginDrag(this)
      deleteItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
    }
    slideContainer.appendChild(text)
    forCloud.slides.savePosition()
  }

  function addText() {
    let text = document.createElement('span')
    text.innerHTML = "Click to enter text"
    text.contentEditable = true
    text.classList.add("edit-slides")
    text.classList.add("draggable-slides")
    text.style = 'position: absolute margin: 0px; line-height: 1;'
    text.onmousedown = function () {
      beginDrag(this)
      deleteItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
    }
    slideContainer.appendChild(text)
    forCloud.slides.savePosition()
  }

  function addImage() {
    let src = prompt("Image Url")
    if (src !== null) {
      let image = document.createElement('img')
      image.draggable = false
      image.src = src
      image.classList.add("edit-slides")
      image.classList.add("draggable-slides")
      image.onmousedown = function () {
        beginDrag(this)
        deleteItem(this)
      }
      image.onblur = () => {
        $('delete-item').disabled = true
      }
      slideContainer.appendChild(image)
      forCloud.slides.savePosition()
    }
  }

  function addSlide() {
    slideshow.push("<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>")
    current_slide = slideshow.length - 1
    forCloud.slides.updateSlide()
  }

  function removeSlide() {
    if (slideshow.length > 1) {
      let remove = confirm("Are you sure you want to remove this slide?")

      if (remove == true) {
        slideshow.splice(current_slide, 1)

        if (current_slide > slideshow.length - 1) {
          current_slide = slideshow.length - 1
        }

        forCloud.slides.updateSlide()
      }
    }
  }

  function previousSlide() {
    if (current_slide > 0) {
      current_slide--
      forCloud.slides.updateSlide()
    }
  }

  function savePosition() {
    slideshow[current_slide] = $('slide').innerHTML
  }

  function updateSlide() {
    slide.innerHTML = slideshow[current_slide]
    let currentSlideText = current_slide + 1
    document.querySelector('#currentSlide').innerText = currentSlideText + '/' + slideshow.length
    for (let i = 0; i < document.getElementsByClassName('edit-slides').length; i++) {
      document.getElementsByClassName('edit-slides')[i].onmousedown = function () {
        beginDrag(this)
        forCloud.slides.deleteItem(this)
      }
      document.getElementsByClassName('edit-slides')[i].onblur = () => {
        $('delete-item').disabled = true
      }
      if (i == document.getElementsByClassName('edit-slides').length - 1) {
        return false
      }
    }
  }

  function nextSlide() {
    if (current_slide < slideshow.length - 1) {
      current_slide++
      forCloud.slides.updateSlide()
    }
  }

  async function saveSlideshow() {
    forCloud.slides.savePosition()
    if (forCloud.getQueryVariable('file') !== false) {
      firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt(JSON.stringify(slideshow)))
    } else {
      forCloud.files.createFile($('slideshow-name').value, forCloud.encrypt(JSON.stringify(slideshow)), '/', 'slideshow').then(() => {
        location.assign('../files/index.html')
      })
    }
  }

  function deleteItem(element) {
    let deleteItem = $('delete-item').cloneNode(true);
    deleteItem.onmousedown = (e) => {
      e.preventDefault()
    }
    deleteItem.addEventListener('click', () => {
      element.remove();
      savePosition();
    })
    deleteItem.disabled = false
    $('delete-item').parentNode.replaceChild(deleteItem, $('delete-item'));
  }

  forCloud.slides.nextSlide = nextSlide
  forCloud.slides.updateSlide = updateSlide
  forCloud.slides.previousSlide = previousSlide
  forCloud.slides.addSlide = addSlide
  forCloud.slides.addImage = addImage
  forCloud.slides.addText = addText
  forCloud.slides.addSubtitle = addSubtitle
  forCloud.slides.addHeader = addHeader
  forCloud.slides.savePosition = savePosition
  forCloud.slides.saveSlideshow = saveSlideshow
  forCloud.slides.removeSlide = removeSlide
  forCloud.slides.deleteItem = deleteItem
  forCloud.slides.beginDrag = beginDrag
  forCloud.slides.dragElement = dragElement
  forCloud.slides.stopDrag = stopDrag

}

$('title').addEventListener('click', (event) => {
  forCloud.slides.addHeader()
})

$('subtitle').addEventListener('click', (event) => {
  forCloud.slides.addSubtitle()
})

$('text').addEventListener('click', (event) => {
  forCloud.slides.addText()
})

$('previousSlide').addEventListener('click', (event) => {
  forCloud.slides.previousSlide()
})

$('nextSlide').addEventListener('click', (event) => {
  forCloud.slides.nextSlide()
})

$('image').addEventListener('click', (event) => {
  forCloud.slides.addImage()
})

$('newSlide').addEventListener('click', (event) => {
  forCloud.slides.addSlide()
})

$('removeSlide').addEventListener('click', (event) => {
  forCloud.slides.removeSlide()
})

$('save').addEventListener('click', (event) => {
  forCloud.slides.saveSlideshow()
})

firebase.auth().onAuthStateChanged(() => {
  if (forCloud.getQueryVariable('file') !== false) {
    $('slideshow-name-div').style.display = 'none'
    firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').on('value', (snapshot) => {
      slideshow = JSON.parse(forCloud.decrypt(snapshot.val()))
      forCloud.slides.updateSlide()
      for (let i = 0; i < document.getElementsByClassName('edit-slides').length; i++) {
        document.getElementsByClassName('edit-slides')[i].onmousedown = function () {
          forCloud.slides.beginDrag(this);
          forCloud.slides.deleteItem(this)
        };
        document.getElementsByClassName('edit-slides')[i].onblur = () => {
          $('delete-item').disabled = true
        }
        if (i == document.getElementsByClassName('edit-slides').length - 1) {
          return false
        }
      }
    })
  }
})
