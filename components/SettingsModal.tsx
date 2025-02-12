import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import FeedbackModal from './FeedbackModal'

export default function SettingsModal({
    isSettingsMode,
    setSettingsMode
}) {
    const { user, setUser } = useContainerContext()
    const [isFeedbackMode, setFeedbackMode] = useState(false)

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
                    {/* <Text style={styles.text}>Settings</Text> */}
                    <TouchableOpacity
                        style={styles.feedbackButton}
                        onPress={() => setFeedbackMode(true)}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>Give Feedback</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.noButton}
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
        width: '80%',
        height: '60%',
        backgroundColor: Colors.black,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    text: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        alignSelf: 'flex-start',
        margin: 20 
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