// import React, { useEffect } from 'react'
import { Modal, View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import AsyncStorage from '@react-native-async-storage/async-storage'


export default function LogoutModal({
    isLogoutMode,
    setLogoutMode
}) {
    const { setUser } = useContainerContext()

    async function signOut() {
        console.log('in signOut')
        await AsyncStorage.removeItem('user')
        setUser(null)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isLogoutMode}
            style={styles.modal}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <Text style={styles.text}>Log out?</Text>
                    <TouchableOpacity
                        style={styles.yesButton}
                        onPress={() => {
                            signOut()
                        }}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.noButton}
                        onPress={() => setLogoutMode(!isLogoutMode)}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>No</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        
    },
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(1, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        height: '60%',
        backgroundColor: Colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    text: {
        fontSize: Styles.fontNormal,
        color: Colors.white
    },
    yesButton: {
        marginTop: 20,
        paddingVertical: 4,
        paddingHorizontal: 4,
        width: 250,
        height: 38,
        backgroundColor: Colors.red,
        alignItems: 'center',
        fontSize: Styles.fontLarge,
        borderRadius: 8,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    noButton: {
        marginTop: 20,
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