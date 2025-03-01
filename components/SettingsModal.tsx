import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, Text, Alert, StyleSheet, ScrollView, Linking } from 'react-native'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import FeedbackModal from './FeedbackModal'

export default function SettingsModal({
    isSettingsMode,
    setSettingsMode
}) {
    const { user, setUser } = useContainerContext()
    const [isFeedbackMode, setFeedbackMode] = useState(false)

    function handleEmailPress() {
        Linking.openURL('google.com')
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isSettingsMode}
            style={styles.modal}
            statusBarTranslucent
        >
            <FeedbackModal
                isFeedbackMode={isFeedbackMode}
                setFeedbackMode={setFeedbackMode}
            />
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={{alignItems: 'center'}}>
                        <Text style={styles.title}>About</Text>
                        <Text style={styles.text}>
                            Vibecheq allows users to take a photo and send it to a randomly-selected recipient. The recipient will then respond with a photo of their own. Vibecheq is completely anonymous, and no data is collected from users other than the phone number used to register each account. Images are vetted with an AI algorithm to detect and filter explicit content.
                        </Text>
                        <Text style={styles.title}>Support</Text>
                        <Text style={styles.text}>
                            If you are experiencing issues while using Vibecheq, please reach out to our support team at vibecheqapp@gmail.com, or submit feedback below.
                        </Text>
                            
                        <TouchableOpacity
                            style={styles.feedbackButton}
                            onPress={() => setFeedbackMode(true)}
                        >
                            <Text style={{fontSize: Styles.fontNormal}}>Give Feedback</Text>
                        </TouchableOpacity>
                        
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSettingsMode(false)}
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
        width: '90%',
        height: '80%',
        backgroundColor: Colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    title: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        alignSelf: 'flex-start',
        marginTop: 20,
        marginHorizontal: 10,
        fontWeight: 'bold'
    },
    text: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        alignSelf: 'flex-start',
        marginHorizontal: 10,
        marginVertical: 10
    },
    feedbackButton: {
        marginTop: 20,
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
    },
    backButton: {
        marginTop: 20,
        marginBottom: 20,
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