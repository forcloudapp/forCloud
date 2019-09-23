'use strict'

firebase.initializeApp({
  apiKey: 'AIzaSyD49Jo0eeB0Y38J3GtN3AaavYU_8Q7cHqQ',
  authDomain: 'forcloudapp.firebaseapp.com',
  databaseURL: 'https://forcloudapp.firebaseio.com',
  projectId: 'forcloudapp',
  storageBucket: 'forcloudapp.appspot.com',
  messagingSenderId: '621514392136',
  appId: '1:621514392136:web:c1e7c3141dace447'
})

const forCloud = {}
forCloud.files = {}

{

  let currentFileContext

  // Element functions.

  function $(id) {
    return document.getElementById(id)
  }

  function $$(selector) {
    return document.querySelector(selector)
  }

  // Storage functions.

  function get(name) {
    return JSON.parse(localStorage.getItem(`forCloudStorage_${name}`))
  }

  function store(name, value) {
    localStorage.setItem(`forCloudStorage_${name}`, JSON.stringify(value))

    return value
  }

  // Account functions.

  async function signIn(username, password) {
    return firebase.auth().signInWithEmailAndPassword(stringifyUsername(username), password)
  }

  async function signOut() {
    return firebase.auth().signOut()
  }

  function stringifyUsername(username) {
    return `${username}@forcloud.app`
  }

  function parseEmail(email) {
    return email.replace('@forcloud.app', '')
  }

  async function getUser() {
    return new Promise(async resolve => {
      firebase.auth().onAuthStateChanged(async user => {
        resolve(user)
      })
    })
  }

  async function getUserEmail() {
    return (await getUser()).email
  }

  async function getUsername() {
    return parseEmail(await getUserEmail())
  }

  async function createFile(name, content, path, type, key, users) {
    if (typeof key !== "undefined") {
      forCloud.files.currentFileContext.child(path).child(name).child('key').set(key)
    }
    if (typeof users !== "undefined") {
      Object.keys(users).forEach(function (user) {
        forCloud.files.currentFileContext.child(path).child(name).child('users').child(user).set('true')
      })
    }
    forCloud.files.currentFileContext.child(path).child(name).child('type').set(type)
    return forCloud.files.currentFileContext.child(path).child(name).child('content').set(content)
  }

  async function createSharedFile(content, path, type,users, key) {
    if (typeof key !== "undefined") {
      firebase.database().ref('shared-files').child('shared').child('files').child(path).child('key').set(key)
    }

    if (typeof users !== "undefined") {
      users.forEach(function (user) {
        firebase.database().ref('shared-files').child('shared').child('files').child(path).child('users').child(user).set('true')
      })
    }
    firebase.database().ref('shared-files').child('shared').child('files').child(path).child('type').set(type)
    return firebase.database().ref('shared-files').child('shared').child('files').child(path).child('content').set(content)

  }

  // Misc. functions.

  function convertTime(time) {
    const date = new Date(time)

    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=')
      if (pair[0] == variable) {
        return pair[1]
      }
    }
    return false
  }

  function createIcon(icon, size) {
    let i = document.createElement('i')
    i.className = 'material-icons'
    i.style.fontSize = size
    let text = document.createTextNode(icon)
    i.appendChild(text)
    return i
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function encrypt(content, key) {
    return CryptoJS.AES.encrypt(content, key) + ""
  }

  function decrypt(content, key) {
    return CryptoJS.AES.decrypt(content, key).toString(CryptoJS.enc.Utf8);
  }

  async function selectFile() {
    const selector = document.createElement('input')

    selector.type = 'file'

    selector.click()

    const promise = new Promise(resolve => {
      selector.addEventListener('change', event => {
        resolve(event.target.files)
      })
    })


    return promise
  }

  async function pickColor() {
    const picker = document.createElement('input')

    picker.type = 'color'

    const promise = new Promise(resolve => {
      picker.addEventListener('change', event => {
        resolve(event.target.value)
      })
    })

    picker.click()

    return promise
  }

  window.$ = $
  window.$$ = $$

  forCloud.get = get
  forCloud.store = store
  forCloud.encrypt = encrypt
  forCloud.decrypt = decrypt
  forCloud.uuid = uuid


  forCloud.signIn = signIn
  forCloud.signOut = signOut
  forCloud.stringifyUsername = stringifyUsername
  forCloud.parseEmail = parseEmail
  forCloud.getUser = getUser
  forCloud.getUserEmail = getUserEmail
  forCloud.getUsername = getUsername
  forCloud.createIcon = createIcon

  forCloud.convertTime = convertTime
  forCloud.selectFile = selectFile
  forCloud.pickColor = pickColor
  forCloud.files.createFile = createFile
  forCloud.files.createSharedFile = createSharedFile
  forCloud.getQueryVariable = getQueryVariable
  forCloud.files.currentFileContext = currentFileContext
}

firebase.auth().onAuthStateChanged(() => {
  forCloud.files.currentFileContext = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files')
})