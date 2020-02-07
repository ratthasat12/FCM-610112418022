const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-60cbb-firebase-adminsdk-jylvr-0db240fc52.json')
const databaseURL = 'https://fcm-60cbb.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-60cbb/messages:send'
const deviceToken =
  'e6JYVMbJ-S6ogP7R1EHRUV:APA91bF_7_eepheMPPyrVW4iqo4PaTLjhfg1r5b7J8oXIdXYvFlpBPzUEooNa7z8WeQdXKZWMWlfNT1IcLflCSsRsdIhnnNa47AM3HJqNCxHzaXjjJ3uTiLIaC6pVtqguLhwzeFqwHGz'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()