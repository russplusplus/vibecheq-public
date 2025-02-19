import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Platform, TextInput, ActivityIndicator, Image, PermissionsAndroid, Dimensions } from 'react-native'
import { Styles, Colors } from '../lib/constants'
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import LogoutModal from './LogoutModal'
import LoadingModal from './LoadingModal'
import WelcomeModal from './WelcomeModal'
import SettingsModal from './SettingsModal'
import { useContainerContext } from './ContainerContext'
import { getUserData } from '../lib/utils'

const log = console.log.bind(console)

log('Platform:', Platform)

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width
log('windowHeight:', windowHeight)
log('windowWidth:', windowWidth)

export default function CameraPage() {

  const [facing, setFacing] = useState<CameraType>('back')
  const [isLogoutMode, setLogoutMode] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isWelcomeMode, setWelcomeMode] = useState<boolean>(false)
  const [isSettingsMode, setSettingsMode] = useState<boolean>(false)
  const [isInboxLoading, setIsInboxLoading] = useState<boolean>(false)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView>(null)

  const { user, setCapturedImageUri, setPage, userData, setUserData, respondingTo, setRespondingTo } = useContainerContext()

  // const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions()

  if (!permission) {
    requestPermission()
  }

  function toggleCameraType() {
    log('in toggleCameraType')
    setFacing(current => (current === 'back' ? 'front' : 'back'))
  }

  async function takePhoto() {
    setLoading(true)
    // if (!cameraRef) return
    const photo = await cameraRef.current.takePictureAsync()
    setCapturedImageUri(photo.uri)
    setLoading(false)
    setPage('ReviewPhoto')
  }

  async function init() {
    if (!user) {
      log('user not found')
      return
    }
    log('in init(). user:', user)

    if (user.additionalUserInfo.isNewUser) {
      log('new user detected')
      setWelcomeMode(true)
    }

    const data = await getUserData(user.user.uid).catch((err) => {
      log('err:', err)
      if (err === 'user data not found') {
        log('user data not found')
      }
      return
    })
    log('data:', data)
    setUserData(data)
  }

  async function viewInbox() {
    if (userData.inbox) {
      setPage('ViewInbox')
    } else {
      setIsInboxLoading(true)
      await init()
      setIsInboxLoading(false)
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (

    <View
      style={styles.container}
    >
      <LoadingModal
        isLoading={isLoading}
      />
      <LogoutModal
        isLogoutMode={isLogoutMode}
        setLogoutMode={setLogoutMode}
      />
      <WelcomeModal
        isWelcomeMode={isWelcomeMode}
        setWelcomeMode={setWelcomeMode}
      />
      <SettingsModal
        isSettingsMode={isSettingsMode}
        setSettingsMode={setSettingsMode}
      />
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        onMountError={(err) => console.log('onMountError:', err)}
      >
        <View
          style={styles.topButtons}
        >
          <TouchableOpacity onPress={() => setLogoutMode(true)}>
            <Ionicons name="return-down-back" size={36} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSettingsMode(true)}>
            <Ionicons name="settings-outline" size={36} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View
          style={styles.bottomButtons}
        >
          <View
            style={styles.bottomTopButtons}
          >
            <TouchableOpacity onPress={toggleCameraType}>
              <MaterialIcons name="cameraswitch" size={36} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View
            style={{...styles.bottomBottomButtons, justifyContent: respondingTo ? 'center' : 'space-between'}}>
            {respondingTo ?
            <Image
              source={{ uri: userData.inbox[Object.keys(userData.inbox)[0]].url }}
              style={styles.image}
            />
            :
            <TouchableOpacity
              style={styles.favorite}>
              <AntDesign name="heart" size={30} color={'transparent'} />
            </TouchableOpacity>
            }
            
            <TouchableOpacity
              onPress={takePhoto}
              style={styles.takePhoto}
            />
            {respondingTo ? 
            <></>
            :
            <TouchableOpacity
              onPress={viewInbox}
              style={styles.inbox}>
              {isInboxLoading
                ? <ActivityIndicator size="small" color='black' />
                : <Text
                    style={styles.inboxText}
                  >{userData?.inbox ? Object.keys(userData.inbox).length : 0}</Text>
              }
            </TouchableOpacity>
            }
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '150%',
    flexDirection: 'column',
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  topButtons: {
    flex: 0.2,
    flexDirection: 'row',
    marginHorizontal: marginHorizontal(),
    marginTop: Platform.OS === "ios" ? 42 : 36,
    justifyContent: 'space-between'
  },
  bottomButtons: {
    flex: 0.2,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: marginHorizontal(),
    marginBottom: Platform.OS === "ios" ? 30 : 20,
  },
  bottomTopButtons: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bottomBottomButtons: {
    flex: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  image: {
    borderRadius: 5,
    height: 210,
    width: 120,
    position: 'absolute',
    left: 0,
    bottom: 0
  },
  favorite: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center'
  },
  takePhoto: {
    width: 70,
    height: 70,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: Colors.white
  },
  inbox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inboxText: {
    fontSize: Styles.fontLarge,
    color: "black"
  }
})

function marginHorizontal() {
  console.log('windowWidth:', windowWidth)
  console.log('Platform.OS:', Platform.OS)
  if (windowWidth < 500) {
    if (Platform.OS === 'ios') {
      return 128
    } else {
      return 118
    }
  } else {
    console.log('window width is greater than 500')
    return 260
  }
}