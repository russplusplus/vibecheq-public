import React, { useState, useEffect } from 'react'
import { 
  Dimensions, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text, 
  Platform, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native'
import { Image } from 'expo-image'
import { Styles, Colors } from '../lib/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import PhoneInput, { ICountry } from 'react-native-international-phone-number'
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import { useContainerContext } from './ContainerContext'
import { recordError } from '../lib/utils'

const log = console.log.bind(console)

const windowHeight = Dimensions.get('window').height

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<null | ICountry>(null);
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [passcodeSent, setPasscodeSent] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [confirm, setConfirm] = useState<any>(null)

  const { user, setUser } = useContainerContext()

  async function sendOtp() {
    log('in sendOtp')
    setLoading(true)
    const fullPhoneNumber = selectedCountry?.callingCode + ' ' + phoneNumber
    console.log('in sendOtp. fullPhoneNumber:', fullPhoneNumber)

    const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber).catch((err) => {
      const errString = err.toString()
      log('errString:', errString)
      if (errString.includes('blocked')) {
        setError('Too many requests. Try again later.')
      } else {
        setError('An unknown error occurred.')
      }
      setLoading(false)
      recordError(err)
      return
    })
    console.log('confirmation:', confirmation)
    if (!confirmation) return
    setConfirm(confirmation)
    setPasscodeSent(true)
    setLoading(false)
    setError('')
  }

  async function verifyOtp() {
    setLoading(true)
    
    const user = await confirm.confirm(password)
      .catch((err) => {
        console.log('err:', err)
        recordError(err)
        const errString = err.toString()
        if (errString.includes('invalid')) {
          setError('Invalid code.')
          setLoading(false)
        } else if (errString.includes('expired')) {
          setError('This code is expired.')
        } else {
          setError('An unknown error occurred.')
        }
      })

    console.log('user:', user)

    const { uid } = user.user
    console.log('code is valid! user:', user)
    await updateRegistrationToken(uid)
    setUser(user)
    await AsyncStorage.setItem("user", JSON.stringify(user))

    setLoading(false)
    setError('')
  }

  async function updateRegistrationToken(uid: string) {
    console.log('in updateRegistrationToken. uid:', uid)
    const authorizationStatus = await messaging().requestPermission()
    console.log('authorizationStatus:', authorizationStatus)
    if (authorizationStatus !== messaging.AuthorizationStatus.AUTHORIZED && authorizationStatus !== messaging.AuthorizationStatus.PROVISIONAL) {
      return
    }
    const registrationToken: string = await messaging().getToken()
    console.log('registrationToken:', registrationToken)
    try {
      await database()
      .ref(`registrationTokens/${uid}`)
      .update({
        registrationToken
      })
    } catch (err) {
      log(err)
      recordError(err)
    }
  }
  

  useEffect(() => {
    console.log('rendered Auth')
  })

  return (
    <View style={styles.container} >
      <>
      <Image
        source={require('../assets/title.png')}
        style={styles.title}
      />
      <Text style={{ color: Colors.red, fontSize: Styles.fontNormal, marginBottom: 4 }}>{error}</Text>
      {passcodeSent ?
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setPassword(text)}
              value={password}
              placeholder="passcode"
              autoCapitalize='none'
              keyboardType="numeric"
            />
          </View>
          <View >
            <TouchableOpacity
              onPress={() => verifyOtp()}
              style={styles.button}
            >
              {loading
              ? <ActivityIndicator size="small" color='black' /> 
              : <Text style={{ fontSize: Styles.fontNormal }}>verify passcode</Text>
              }
            </TouchableOpacity>
          </View>
        </>
        :
        <TouchableWithoutFeedback onPress={() => {
          console.log('touch anywhere')
          Keyboard.dismiss
        }}>
          <>
            <View style={styles.inputContainer}>
              <PhoneInput
                phoneInputStyles={phoneInputStyles}
                modalStyles={modalStyles}
                onChangePhoneNumber={(value: string) => setPhoneNumber(value)}
                value={phoneNumber}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={(value: ICountry) => setSelectedCountry(value)}
                defaultCountry='US'
                placeholder='phone number'
              />
            </View>
            <View >
              <TouchableOpacity
                onPress={sendOtp}
                style={styles.button}
              >
                {loading 
                ? <ActivityIndicator size="small" color='black' /> 
                : <Text style={{ fontSize: Styles.fontNormal }}>Send passcode</Text>
                }
              </TouchableOpacity>
            </View>
          </>
        </TouchableWithoutFeedback>
      }
      </>
    </View>
  )
}

const modalStyles = {
  modal: {
    backgroundColor: Colors.black
  },
  searchInput: {
    color: 'black',
    fontSize: Styles.fontNormal,
  },
  countryButton: {
    backgroundColor: Colors.white,
    borderWidth: 0
  },
  callingCode: {
    color: 'black',
    fontSize: Styles.fontNormal,
    marginHorizontal: 0,
  },
  countryName: {
    color: 'black',
    fontSize: Styles.fontNormal,
  }
}

const phoneInputStyles = {
  container: {
    backgroundColor: Colors.white,
    borderWidth: 0,
    borderColor: '#F3F3F3',
    fontColor: 'black',
    height: 45,
  },
  flagContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
  },
  flag: {
  },
  caret: {
    color: 'black',
    fontSize: Styles.fontNormal,
  },
  divider: {
    backgroundColor: 'black',
  },
  callingCode: {
    fontSize: Styles.fontNormal,
    color: 'black',
    fontWeight: 'normal',
  },
  input: {
    fontSize: Styles.fontNormal,
    paddingHorizontal: 0,
  },
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: getTopMargin(windowHeight),
    marginBottom: 6,
    width: '100%',
    height: getTitleHeight(windowHeight)
  },
  inputLabel: { 
    color: Colors.white, 
    fontSize: Styles.fontNormal,
    marginBottom: 0
  },
  inputContainer: {
    width: 300,
  },
  input: {
    backgroundColor: Colors.white,
    paddingVertical: 0,
    paddingHorizontal: 12,
    height: 45,
    fontSize: Styles.fontNormal,
    borderRadius: 8,
  },
  button: {
    marginVertical: 20,
    paddingVertical: 4,
    paddingHorizontal: 4,
    width: 250,
    height: 38,
    backgroundColor: Colors.white,
    alignItems: 'center',
    fontSize: Styles.fontLarge,
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'center'
  }
})

function getTopMargin(height: number) {
  console.log('height:', height)
  if (height < 800) {
    return 250
  } else if (height < 900) {
    return 300
  } else if (height < 1100) {
    return 350
  } else {
    return 400
  }
}

function getTitleHeight(height: number) {
  if (height > 1100) {
    return 250
  } else if (height > 900) {
    return 140
  } else {
    return 100
  }
}