const functions = require('firebase-functions');
const admin = require('firebase-admin');

// This package (@google-cloud/storage) must be used instead of
// firebase-admin for storage, because it can create signed URLs
// that never expire. The firebase-admin sdk can only create 
// signed URLs that last up to a week.
const { Storage } = require('@google-cloud/storage');
const gcs = new Storage({keyFilename: './service-account-PROD.json'});
const { modelUrl, modelWeightUrls } = require('./constants')
const pdjs = require('private-detector-js')

admin.initializeApp();

exports.addUser = functions.auth.user().onCreate(user => {
  console.log('user:', user)
  admin
  .database()
  .ref(`userData/${user.uid}`)
  .set({
    phoneNumber: user.phoneNumber,
    settings: {
      leftHandedMode: false
    }
  });
});

const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '2GB'
}

exports.addImage = functions.runWith(runtimeOpts).storage.object('/images').onFinalize(async (object) => {
  console.log('in addImage function')

  // The sender's UID (fromUid) and isResponding are attached as metadata to storage object
  console.log('object.metadata.fromUid:', object.metadata.fromUid)
  const senderUid = object.metadata.fromUid

  const imageUrl = await createSignedUrl(object.name)
  console.log('imageUrl:', imageUrl)

  // const specialImageUrl = await createSignedUrl('images/PXL_20240518_203402708.jpg')
  // console.log('specialImageUrl:', specialImageUrl)

  // const specialImageUrl2 = await createSignedUrl('images/PXL_20240913_150451993.jpg')
  // console.log('specialImageUrl2:', specialImageUrl2)

  if (await isImageExplicit(imageUrl)) {
    console.log('image is explicit')
    // recordImageInDatabase(imageUrl, senderUid)
    return
  }

  console.log('image is not explicit. Determining recipient...')

  const allUsersSnapshot = await admin.database().ref('registrationTokens').once('value')
  const allUsers = await allUsersSnapshot.val()

  console.log('object.metadata.toUid:', object.metadata.toUid)
  const isResponse = object.metadata.toUid ? true : false
  console.log('isResponse:', isResponse)

  const recipientUid = object.metadata.toUid || await determineRecipientUid(allUsers, senderUid)

  const imageData = {
    from: senderUid,
    to: recipientUid, // is this necessary?
    isResponse: isResponse,
    url: imageUrl,
    respondingToImageName: object.metadata.respondingToImageName || null,
    respondingToImageUrl: object.metadata.respondingToImageUrl || null
  }

  await addDatabaseEntry(object.name.substring(7), imageData)
  
  await sendNotification(allUsers[recipientUid].registrationToken, isResponse)
});



async function createSignedUrl(filename) {
  const bucket = gcs.bucket("vibecheq-prod.appspot.com");
  // console.log('bucket:', bucket)
  const file = bucket.file(filename);
  // console.log('file:', file)
  const urlArr = await file.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  })
  const url = urlArr[0]
  return url
}

function getWeightUrls(shardName) {
  return modelWeightUrls[shardName]
}

async function isImageExplicit(imageUrl) {
  const options = {
    weightUrlConverter: getWeightUrls
  }
  console.log('options:', options)

  const filePaths = [
    imageUrl
  ]
  console.log('filePaths:', filePaths)

  const probs = await pdjs.RunInference(modelUrl, filePaths, options)
  console.log('probs:', probs)
  // return (probs[0] > 0.1)
  return (probs[0] > 0.8)
}

async function determineRecipientUid(allUsers, senderUid) {
  return new Promise(async (resolve, reject) => {

    console.log('no recipient UID found in metadata. Randomly assigning recipient...')
    console.log('allUsers:', allUsers)
    let allUsersArr = []
    for (let user in allUsers) {
      allUsersArr.push(user)
    }
    console.log('senderUid:', senderUid)

    let recipientUid
    let loopCount = 0
    let isValid = false
    do {
      loopCount++
      console.log('loopCount:', loopCount)
      if (loopCount === 100) {
        console.log('100th loop reached. Exiting loop...')
        isValid = true
      }

      recipientUid = allUsersArr[Math.floor(Math.random() * allUsersArr.length)]

      if (!recipientUid) {
        console.log('recipient is falsey:', recipientUid)
        continue
      }
    
      if (recipientUid === senderUid) {
        console.log(`recipient ${recipientUid} is the same as sender ${senderUid}`)
        continue
      }

      const isRecipientBlocked = await isRecipientUidBlocked(recipientUid, senderUid)
      if (isRecipientBlocked) {
        continue
      }

      isValid = true

    } while (!isValid)

    console.log('after isRecipientUidValid passed. recipientUid:', recipientUid)
    resolve(recipientUid)
  })
}

function isRecipientUidBlocked(recipient, sender) {
  return new Promise(async (resolve, reject) => {
    console.log('in isRecipientUidValid. recipient:', recipient, '. sender:', sender)

    const blockListSnapshot = await admin
      .database()
      .ref(`userData/${recipient}/blockList`)
      .once('value')
      .catch((err) => {
        console.log('get blockList error:', err)
        reject(err)
      })

    const blockList = blockListSnapshot.val()
    console.log("blockList:", blockList)
    const blockListArr = blockList ? Object.keys(blockList) : []
    console.log('blockListArr:', blockListArr)

    if (blockListArr.includes(sender)) {
      console.log(`sender ${sender} is blocked by recipient ${recipient}`)
      resolve(true)
      return
    }

    console.log(`recipient ${recipient} is valid`)
    resolve(false)
  })
}

async function createModelWeightSignedUrls(numberOfShards) {
  // created signedUrls for each shard file
  let weightUrls = {}
  for (let i = 1; i <= numberOfShards; i++) {
    const shardFile = bucket.file(`model/group1-shard${i}of${numberOfShards}.bin`)
    const shardUrlArr = await shardFile.getSignedUrl({
      action: 'read',
      expires: '03-09-2491'
    })
    const shardUrl = shardUrlArr[0]
    weightUrls[`group1-shard${i}of${numberOfShards}.bin`] = shardUrl
  }
  console.log('weightUrls:', weightUrls)
}

async function addDatabaseEntry(imageFilename, imageData) {
  console.log('in addDatabaseEntry. imageData:', imageData)

  console.log('imageData.to:', imageData.to)
  console.log('imageData.from:', imageData.from)
  await admin
    .database()
    .ref(`userData/${imageData.to}/inbox/${imageFilename}`)
    .set(imageData)
}

async function sendNotification(recipientRegistrationToken, isResponse) {
  // send FCM
  console.log('response block recipientToken:', recipientRegistrationToken)
  let payload = {
    notification: {
      title: isResponse ? 'New response!' : 'New Vibe!',
      body: 'Open Vibecheq to view it',
      imageUrl: 'https://my-cdn.com/app-logo.png',
    },
    token: recipientRegistrationToken
  }
  admin
    .messaging()
    .send(payload)
    .then(function(response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function(error) {
      console.log("Error sending message:", error);
  });
}

async function recordImageInDatabase(imageUrl, senderUid) {
  const dateTime = new Date().toLocaleString()

  const data = {
    imageUrl,
    senderUid,
    dateTime
  }

  await admin
    .database()
    .ref(`flaggedImages`)
    .set(data)
}