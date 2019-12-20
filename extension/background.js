var firebaseConfig = {
  apiKey: 'AIzaSyCITcbZbAQCpm-HhVcFLfwbWS4l8jEFPhk',
  authDomain: 'latest-dtinth.firebaseapp.com',
  databaseURL: 'https://latest-dtinth.firebaseio.com',
  projectId: 'latest-dtinth',
  storageBucket: 'latest-dtinth.appspot.com',
  messagingSenderId: '222566906531',
  appId: '1:222566906531:web:c6c8d9e017564662cb9d16',
}
firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()

firebase
  .firestore()
  .enablePersistence()
  .catch(function(err) {
    console.error('Failed to enable persistence...', err)
  })

const state = {
  latestSnapshot: null,
}

db.collection('cards').onSnapshot(function(snapshot) {
  state.latestSnapshot = snapshot
  console.log('Received snapshot')
})

function getLatestSnapshot() {
  const items = {}
  if (state.latestSnapshot) {
    state.latestSnapshot.forEach(doc => {
      items[doc.id] = doc.data()
    })
  }
  return JSON.parse(JSON.stringify(items))
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'snapshot') {
    const items = getLatestSnapshot()
    sendResponse({ type: 'snapshot-response', items })
  }
})
