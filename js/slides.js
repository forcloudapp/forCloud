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
    text.style = 'position: absolute margin: 0px; font-size: 48px; line-height: 1; z-index: 1073741824;'
    text.onmousedown = () => {
      beginDrag(text)
      deleteItem(this)
      positionItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
      $('bring-front').disabled = true
      $('move-back').disabled = true
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
    text.style = 'position: absolute margin: 0px color: gray; font-size: 24px; line-height: 1; z-index: 1073741824;'
    text.onmousedown = function () {
      beginDrag(this)
      deleteItem(this)
      positionItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
      $('bring-front').disabled = true
      $('move-back').disabled = true
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
    text.style = 'position: absolute margin: 0px; line-height: 1; z-index: 1073741824;'
    text.onmousedown = function () {
      beginDrag(this)
      deleteItem(this)
      positionItem(this)
    }
    text.onblur = () => {
      $('delete-item').disabled = true
      $('bring-front').disabled = true
      $('move-back').disabled = true
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
      image.style = 'z-index: 1073741824;'
      image.classList.add("edit-slides")
      image.classList.add("draggable-slides")
      image.onmousedown = function () {
        beginDrag(this)
        deleteItem(this)
        positionItem(this)
      }
      image.onblur = () => {
        $('delete-item').disabled = true
        $('bring-front').disabled = true
        $('move-back').disabled = true
      }
      slideContainer.appendChild(image)
      forCloud.slides.savePosition()
    }
  }

  function bringForward(element) {
    element.style.zIndex = Number(element.style.zIndex) + 1
  }

  function moveBackward(element) {
    element.style.zIndex = Number(element.style.zIndex) - 1
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
        forCloud.slides.positionItem(this)
      }
      document.getElementsByClassName('edit-slides')[i].onblur = () => {
        $('delete-item').disabled = true
        $('bring-front').disabled = true
        $('move-back').disabled = true
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
      firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('keys').on('value', (snapshot) => {
        forCloud.getUsername().then((userName) => {
          let slidesKey = forCloud.decryptPrivate(snapshot.child(userName).val())
          firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).child('content').set(forCloud.encrypt(JSON.stringify(slideshow), slidesKey))
        })
      })
    } else {
      forCloud.getUsername().then((userName) => {
        let keys = {}
        let newKey = forCloud.uuid()
        forCloud.encryptPublic(newKey, userName).then((result) => {
          keys[userName] = result
          forCloud.files.createFile($('slideshow-name').value, forCloud.encrypt(JSON.stringify(slideshow), newKey), '/', 'slideshow', keys).then(() => {
            location.assign('../files/index.html')
          })
        })
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

  function positionItem(element) {
    let bringFront = $('bring-front').cloneNode(true);
    bringFront.onmousedown = (e) => {
      e.preventDefault()
    }
    bringFront.addEventListener('click', () => {
      forCloud.slides.bringForward(element)
      forCloud.slides.beginDrag(element)
      forCloud.slides.savePosition();
    })
    bringFront.disabled = false
    $('bring-front').parentNode.replaceChild(bringFront, $('bring-front'));

    let moveBack = $('move-back').cloneNode(true);
    moveBack.onmousedown = (e) => {
      e.preventDefault()
    }
    moveBack.addEventListener('click', () => {
      forCloud.slides.moveBackward(element)
      forCloud.slides.beginDrag(element)
      forCloud.slides.savePosition();
    })
    moveBack.disabled = false
    $('move-back').parentNode.replaceChild(moveBack, $('move-back'));
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
  forCloud.slides.positionItem = positionItem
  forCloud.slides.bringForward = bringForward
  forCloud.slides.moveBackward = moveBackward
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
    firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).on('value', (snapshot) => {
      forCloud.getUsername().then((userName) => {
        let key = snapshot.child('keys').child(userName.toLowerCase()).val()
        firebase.database().ref(decodeURI(forCloud.getQueryVariable('file')).split(',').join('/')).on('child_changed', (child) => {
          slideshow = JSON.parse(forCloud.decrypt(snapshot.child('content').val(), forCloud.decryptPrivate(key)))
        })
        slideshow = JSON.parse(forCloud.decrypt(snapshot.child('content').val(), forCloud.decryptPrivate(key)))
        forCloud.slides.updateSlide()
      })
      for (let i = 0; i < document.getElementsByClassName('edit-slides').length; i++) {
        document.getElementsByClassName('edit-slides')[i].onmousedown = function () {
          forCloud.slides.beginDrag(this);
          forCloud.slides.deleteItem(this)
          forCloud.slides.positionItem(this)
        };
        document.getElementsByClassName('edit-slides')[i].onblur = () => {
          $('delete-item').disabled = true
          $('bring-front').disabled = true
          $('move-back').disabled = true
        }
        if (i == document.getElementsByClassName('edit-slides').length - 1) {
          return false
        }
      }
    })
  }
})
