import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform
} from "react-native";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import { useContainerContext } from "./ContainerContext";
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import { Styles, Colors } from '../lib/constants'
import ViewInboxOptions from "./ViewInboxOptions";
import LoadingModal from "./LoadingModal"

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

export default function ViewInbox() {
  const [optionsMode, setOptionsMode] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const { user, setPage, respondingTo, setRespondingTo, userData, userUid } = useContainerContext();

  async function prefetch() {
    await Image.prefetch(userData.inbox[Object.keys(userData.inbox)[0]].url)
  }

  async function handlePressAnywhere() {
    setLoading(true)
    console.log("in handlePressAnywhere");
    // don't delete from database or storage yet if the user will be responding,
    // because we need the first inbox image to show in CameraPage and ReviewPhoto.
    if (respondingTo) {
      setPage('CameraPage')
      return
    }
    // delete from database
    const inboxImageName = Object.keys(userData.inbox)[0];
    console.log('userUid:', userUid)
    console.log('inboxImageName:', inboxImageName)
    await database().ref(`userData/${userUid}/inbox/${inboxImageName}`).remove();

    // delete from storage
    const { respondingToImageName } = userData.inbox[inboxImageName]
    await storage().ref(`images/${inboxImageName}`).delete()
    await storage().ref(`images/${respondingToImageName}`).delete()
    
    setPage('CameraPage');
  }

  useEffect(() => {
    console.log('in ViewInbox useEffect')
    prefetch()

    if (userData.inbox[Object.keys(userData.inbox)[0]].isResponse) {
      setRespondingTo(null);
    } else {
      setRespondingTo(
        userData.inbox[Object.keys(userData.inbox)[0]].from
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      <ViewInboxOptions
        optionsMode={optionsMode}
        setOptionsMode={setOptionsMode}
      />

      <LoadingModal
        isLoading={isLoading}
      />

      <TouchableWithoutFeedback onPress={handlePressAnywhere}>
        <View
          style={styles.background}
        >
          <Image
            style={styles.backgroundImage}
            source={{
              uri: userData.inbox[Object.keys(userData.inbox)[0]].url,
            }}
          />
          <View style={styles.topButtons}>
            <TouchableOpacity onPress={() => setOptionsMode(true)}>
              <SimpleLineIcons name="options" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          {userData.inbox[Object.keys(userData.inbox)[0]].isResponse ?
            <Image
              source={{ uri: userData.inbox[Object.keys(userData.inbox)[0]].respondingToImageUrl }}
              style={styles.image}
            />
            :
            null
          }
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    height: windowHeight,
    width: windowWidth,
    left: 0,
    bottom: 0
  },
  image: {
    borderRadius: 5,
    height: 210,
    width: 120,
    position: 'absolute',
    left: 0,
    bottom: 0,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  topButtons: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: Platform.OS === "ios" ? 42 : 36,
    marginHorizontal: marginHorizontal()
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

