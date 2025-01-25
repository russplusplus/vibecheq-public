// import React, { useEffect } from 'react'
import { Modal, View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native'
// import { supabase } from '../lib/supabase'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import AsyncStorage from '@react-native-async-storage/async-storage'


export default function WelcomeModal({
    isWelcomeMode,
    setWelcomeMode
}) {
    // const { user, setUser } = useContainerContext()


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isWelcomeMode}
            style={styles.modal}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Welcome to Vibecheq!</Text>
                    <Text style={styles.text}>Here's how it works:</Text>
                    <View style={styles.bulletContainer}>
                        <Text style={styles.bullet}>-</Text>
                        <Text style={styles.bullet}>All photos you send will go to randomly-selected recipients.</Text>
                    </View>
                    <View style={styles.bulletContainer}>
                        <Text style={styles.bullet}>-</Text>
                        <Text style={styles.bullet}>View your inbox (bottom right) to see responses to your photos, as well as photos you receive randomly.</Text>
                    </View>
                    <View style={styles.bulletContainer}>
                        <Text style={styles.bullet}>-</Text>
                        <Text style={styles.bullet}>All exchanges are anonymous.</Text>
                    </View>



                    <TouchableOpacity
                        style={styles.button}
                        // onPress={() => setLogoutMode(!logoutMode)}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>Start</Text>
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
    title: {
        fontSize: Styles.fontNormal,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 30
    },
    text: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        textAlign: 'left',
        width: '90%',
        marginBottom: 20
    },
    bulletContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '90%'
    },
    bullet: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        textAlign: 'left',
        marginBottom: 20
    },
    button: {
        marginTop: 30,
        paddingVertical: 4,
        paddingHorizontal: 4,
        width: 250,
        height: 38,
        backgroundColor: Colors.blue,
        alignItems: 'center',
        fontSize: Styles.fontLarge,
        borderRadius: 8,
        flexDirection: 'column',
        justifyContent: 'center'
    }
})