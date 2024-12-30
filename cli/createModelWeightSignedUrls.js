const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const gcs = new Storage({keyFilename: '../functions/functions/service-account-PROD.json'});

// createModelWeightSignedUrls(51)
createModelJSONUrl()

async function createModelWeightSignedUrls(numberOfShards) {
  const bucket = gcs.bucket("vibecheq-prod.appspot.com");

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

async function createModelJSONUrl() {
  const bucket = gcs.bucket("vibecheq-prod.appspot.com");

  const modelFile = bucket.file(`model/model.json`)
  const modelUrlArr = await modelFile.getSignedUrl({
    action: 'read',
    expires: '03-09-2491'
  })
  const modelUrl = modelUrlArr[0]

  console.log('modelUrl:', modelUrl)
}