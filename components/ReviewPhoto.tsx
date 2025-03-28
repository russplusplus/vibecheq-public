import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions
} from "react-native";
import { Styles, Colors } from "../lib/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import storage from "@react-native-firebase/storage";
import database from '@react-native-firebase/database'
import { useContainerContext } from "./ContainerContext"
import { recordError } from '../lib/utils';
import mobileAds, { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const adUnitId = __DEV__ ? TestIds.REWARDED : Platform.OS === "ios" ? "ca-app-pub-3618369904609105/7605742442" : "ca-app-pub-3618369904609105/6484232463"

// mobileAds()
//   .setRequestConfiguration({
//     testDeviceIdentifiers: ["EMULATOR"]
//   })

mobileAds()
  .initialize()
  .then(adapterStatuses => {
    console.log('adapterStatuses:', adapterStatuses)
  })

const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {})

async function uploadPhoto(uri: string, userUid: string, recipient: string, respondingToImageName: string, respondingToImageUrl: string) {
  return new Promise(async (resolve, reject) => {
    console.log("in uploadPhoto");
    console.log('userUid:', userUid)
    console.log('respondingToImageName:', respondingToImageName)
    console.log('respondingToImageUrl:', respondingToImageUrl)

    try {
      let filename = new Date().getTime();
      const refName = "images/" + String(filename);
      const ref = storage().ref(refName);

      const metadata = {
        customMetadata: {
          fromUid: userUid,
          toUid: recipient,
          respondingToImageName: respondingToImageName,
          respondingToImageUrl: respondingToImageUrl
        },
      };
      console.log("uri:", uri);
      const res = await ref.putFile(uri, metadata).catch((err) => {
        console.log('err:', err)
        recordError(err, {user: userUid, function: "uploadPhoto"})
      })

      resolve(res);
    } catch (error) {
      console.log("error:", error);
      recordError(error, {user: userUid, function: "uploadPhoto"})
      reject(error);
    }
  });
}

export default function ReviewPhoto(): React.JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [isAdLoaded, setAdLoaded] = useState(false)
  const {
    user,
    userData,
    capturedImageUri,
    setPage,
    respondingTo,
    setRespondingTo,
    userUid
  } = useContainerContext();

  async function sendPhoto() {
    setLoading(true);
    console.log("sending photo. user:", user);
    let inboxImageName = respondingTo ? Object.keys(userData.inbox)[0] : ''
    let inboxImageUrl = respondingTo ? userData.inbox[Object.keys(userData.inbox)[0]].url : ''
    // "as StorageData" is a type assertion
    const storageData = await uploadPhoto(
      capturedImageUri,
      userUid,
      respondingTo,
      inboxImageName,
      inboxImageUrl
    );
    console.log("storageData:", storageData);


    if (respondingTo) {
      // delete from database
      const toBeDeleted = Object.keys(userData.inbox)[0];
      console.log('userUid:', userUid)
      console.log('toBeDeleted:', toBeDeleted)
      await database().ref(`userData/${userUid}/inbox/${toBeDeleted}`).remove()  
    }


    if (isAdLoaded) {
      console.log('showing ad')
      rewardedAd.show()
    } else {
      console.log('ad is not loaded yet')
    }

    setRespondingTo(null);
    setLoading(false);
    setPage("CameraPage");
  }

  useEffect(() => {
    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('ad is loaded')
      setAdLoaded(true);
    });

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        console.log('User earned reward of ', reward);
      },
    );

    // Start loading the rewarded ad straight away
    rewardedAd.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, [])

  return (
    <View style={styles.background}>
      <Image
        source={{ uri: capturedImageUri }}
        style={styles.backgroundImage}
      />
      <View style={styles.bottomButtons}>
        {respondingTo ? (
          <Image
            source={{
              uri: userData.inbox[Object.keys(userData.inbox)[0]].url,
            }}
            style={styles.image}
          />
        ) : null}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setPage("CameraPage")}
        >
          <FontAwesome6 name="xmark" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendPhoto} style={styles.sendButton}>
          {loading ? (
            <ActivityIndicator size={"small"} color="black" />
          ) : (
            <MaterialCommunityIcons name="send" size={34} color="black" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  backgroundImage: {
    position: 'absolute',
    height: windowHeight,
    width: windowWidth,
    left: 0,
    bottom: 0
  },
  bottomButtons: {
    flex: 0.5,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    // width: '100%',
    marginHorizontal: marginHorizontal(),
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  image: {
    borderRadius: 5,
    height: 210,
    width: 120,
    position: "absolute",
    left: 0,
    bottom: 0,
  },
  cancelButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.blue,
    justifyContent: "center",
    alignItems: "center",
  },
});

function marginHorizontal() {
  console.log('windowWidth:', windowWidth)
  console.log('Platform.OS:', Platform.OS)
  if (windowWidth < 500) {
    if (Platform.OS === 'ios') {
      return 28
    } else {
      return 18
    }
  } else {
    console.log('window width is greater than 500')
    return 160
  }
}
