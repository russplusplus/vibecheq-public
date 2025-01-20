import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, Text, Alert, StyleSheet, ActivityIndicator } from 'react-native'
// import { supabase } from '../lib/supabase'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import database from '@react-native-firebase/database'
import storage from '@react-native-firebase/storage'

const log = console.log.bind(console)

export default function ViewInboxOptions({
    optionsMode,
    setOptionsMode
}) {
    const [isBlockLoading, setBlockLoading] = useState(false)
    const [isReportLoading, setReportLoading] = useState(false)
    const [isSenderBlocked, setSenderBlocked] = useState(false)
    const [isSenderReported, setSenderReported] = useState(false)
    const { user, setPage, respondingTo, setRespondingTo, userData } = useContainerContext();

    const { uid } = user.user

    async function blockUser() {
        if (isBlockLoading || isSenderBlocked) return
        setBlockLoading(true)

        const today = String(new Date())
        await database()
            .ref(`userData/${uid}/blockList/${respondingTo}`)
            .set({
                date: today
            }).catch((err) => {
                console.log('blockUser err:', err)
            })

        deleteFromInbox()
        deleteFromStorage()
            
        setSenderBlocked(true)
    }
    
    async function reportUser() {
        if (isReportLoading || isSenderReported) return
        setReportLoading(true)

        const today = String(new Date())
        const newRef = database().ref(`/reports/${respondingTo}`).push()
        await newRef
            .set({
                date: today,
                reportedBy: uid
            }).catch((err) => {
                console.log('reportUser err:', err)
            })
        
        deleteFromInbox()
        deleteFromStorage()

        setSenderReported(true)
    }

    async function deleteFromInbox() {
        const toBeDeleted = Object.keys(userData.inbox)[0];
        console.log('uid:', uid)
        console.log('toBeDeleted:', toBeDeleted)
        await database().ref(`userData/${uid}/inbox/${toBeDeleted}`).remove();  
    }

    async function deleteFromStorage() {
        const inboxImageName = Object.keys(userData.inbox)[0];
        await storage().ref(`images/${inboxImageName}`).delete()
    }

    function handleBackPress() {
        if (isSenderBlocked || isSenderReported) {
            setRespondingTo(null)
            setPage("CameraPage")
        }
        setOptionsMode(false)
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={optionsMode}
            style={styles.modal}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <Text style={styles.text}>Bad vibes?</Text>
                    <TouchableOpacity
                        style={styles.blockButton}
                        onPress={blockUser}
                    >
                        {isSenderBlocked
                        ? <Text style={{fontSize: Styles.fontNormal}}>User has been blocked.</Text>
                        : <>
                            {isBlockLoading
                            ? <ActivityIndicator size="small" color="black" />
                            : <Text style={{fontSize: Styles.fontNormal}}>Block User</Text>
                            }
                        </>}
                        
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.reportButton}
                        onPress={reportUser}
                    >
                        {isSenderReported
                        ? <Text style={{fontSize: Styles.fontNormal}}>User has been reported.</Text>
                        : <>
                            {isReportLoading
                            ? <ActivityIndicator size="small" color="black" />
                            : <Text style={{fontSize: Styles.fontNormal}}>Report User</Text>
                            }
                        </>
                        }
                        
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleBackPress}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>Back</Text>
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
    blockButton: {
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
    reportButton: {
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
    button: {
        marginTop: 60,
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