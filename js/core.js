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

  async function getUserid() {
    return (await getUser()).uid
  }

  async function getUsername() {
    return parseEmail(await getUserEmail())
  }

  async function createFile(name, content, path, type, keys, users) {
    const title = name
    const fileObject = { title, content, keys, type, users }

    if (!fileObject.keys) {
      delete fileObject.keys
    }

    if (!fileObject.users) {
      delete fileObject.users
    }

    forCloud.files.currentFileContext.child(path).push(fileObject)
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

  async function encryptPublic(content, user) {
    return new Promise((resolve, reject) => {
      firebase.database().ref('/keys').child(user).on('value', (snapshot) => {
        let encrypt = new JSEncrypt()
        encrypt.setPublicKey(snapshot.val())
        resolve(encrypt.encrypt(content))
      })
    })
  }

  function decryptPrivate(content) {
    let decrypt = new JSEncrypt()
    decrypt.setPrivateKey(forCloud.get('key'))
    return decrypt.decrypt(content);
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
  forCloud.getUserid = getUserid
  forCloud.createIcon = createIcon
  forCloud.decryptPrivate = decryptPrivate
  forCloud.encryptPublic = encryptPublic


  forCloud.convertTime = convertTime
  forCloud.selectFile = selectFile
  forCloud.pickColor = pickColor
  forCloud.files.createFile = createFile
  forCloud.getQueryVariable = getQueryVariable
  forCloud.files.currentFileContext = currentFileContext
}

firebase.auth().onAuthStateChanged(() => {
  if (firebase.database) {
    forCloud.files.currentFileContext = firebase.database().ref('/users').child(firebase.auth().currentUser.uid).child('files')
  }
})