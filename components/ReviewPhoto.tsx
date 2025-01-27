import React, { useState, useEffect } from "react";
import {
  Modal,
  ImageBackground,
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
// import { supabase } from '../lib/supabase'
import storage from "@react-native-firebase/storage";
import database from '@react-native-firebase/database'
import { useContainerContext } from "./ContainerContext";

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

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
      const res = await ref.putFile(uri, metadata);

      resolve(res);
    } catch (error) {
      console.log("error:", error);
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
  } = useContainerContext();

  async function sendPhoto() {
    setLoading(true);
    console.log("sending photo");
    console.log('user.user.uid:', user.user.uid)
    let inboxImageName = respondingTo ? Object.keys(userData.inbox)[0] : ''
    let inboxImageUrl = respondingTo ? userData.inbox[Object.keys(userData.inbox)[0]].url : ''
    // "as StorageData" is a type assertion
    const storageData = await uploadPhoto(
      capturedImageUri,
      user.user.uid,
      respondingTo,
      inboxImageName,
      inboxImageUrl
    );
    console.log("storageData:", storageData);


    if (respondingTo) {
      // delete from database
      const { uid } = user.user;
      const toBeDeleted = Object.keys(userData.inbox)[0];
      console.log('uid:', uid)
      console.log('toBeDeleted:', toBeDeleted)
      await database().ref(`userData/${uid}/inbox/${toBeDeleted}`).remove();  
    }


    // if (isAdLoaded) rewardedAd.show()


    setRespondingTo(null);
    setLoading(false);
    setPage("CameraPage");
  }

  // useEffect(() => {
  //   const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
  //     console.log('ad is loaded')
  //     setAdLoaded(true);
  //   });

  //   const unsubscribeEarned = rewardedAd.addAdEventListener(
  //     RewardedAdEventType.EARNED_REWARD,
  //     reward => {
  //       console.log('User earned reward of ', reward);
  //     },
  //   );

  //   // Start loading the rewarded ad straight away
  //   rewardedAd.load();

  //   // Unsubscribe from events on unmount
  //   return () => {
  //     unsubscribeLoaded();
  //     unsubscribeEarned();
  //   };
  // }, [])

  return (
    <ImageBackground
      source={{ uri: capturedImageUri }}
      style={styles.background}
    >
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
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
