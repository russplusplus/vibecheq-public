import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { Styles, Colors } from '../lib/constants'
import { useContainerContext } from './ContainerContext'
import database from '@react-native-firebase/database'

export default function FeedbackModal({
    isFeedbackMode,
    setFeedbackMode
}) {
    const [isSubmitting, setSubmitting] = useState(false)
    const [isSubmissionComplete, setSubmissionComplete] = useState(false)
    const [input, setInput] = useState("")
    const { user, setUser } = useContainerContext()

    async function submit() {
        if (isSubmitting || isSubmissionComplete) return
        setSubmitting(true)

        const today = String(new Date())
        const { uid } = user.user
        const newRef = database()
            .ref(`feedback/${uid}`)
            .push({
                date: today
            })

        await newRef.set({
            date: today,
            feedback: input
        }).catch((err) => {
            console.log('feedback set err:', err)
        })

        setSubmitting(false)
        setSubmissionComplete(true)
    }

    function handleBackPress() {
        setFeedbackMode(false)
        setSubmissionComplete(false)
        setSubmitting(false)
        setInput("")
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isFeedbackMode}
            style={styles.modal}
            statusBarTranslucent
        >
            <View style={styles.container}>
                <View style={styles.modalContainer}>
                    <Text style={styles.text}>What could Vibecheq improve?</Text>
                    <TextInput
                        editable
                        multiline={true}
                        numberOfLines={6}
                        maxLength={1000}
                        onChangeText={text => setInput(text)}
                        value={input}
                        style={styles.input}
                        inputMode={'text'}
                    />
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={submit}
                    >
                        {isSubmissionComplete
                        ? <Text style={{fontSize: Styles.fontNormal}}>Feedback Submitted!</Text>
                        : <>
                            {isSubmitting
                            ? <ActivityIndicator size="small" color="black" />
                            : <Text style={{fontSize: Styles.fontNormal}}>Submit</Text>
                            }
                        </>
                        }
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleBackPress}
                    >
                        <Text style={{fontSize: Styles.fontNormal}}>{isSubmissionComplete ? "Back" : "Cancel"}</Text>
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
        height: '80%',
        backgroundColor: Colors.black,
        // justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8
    },
    text: {
        fontSize: Styles.fontNormal,
        color: Colors.white,
        alignSelf: 'flex-start',
        margin: 20 
    },
    input: {
        width: '90%',
        backgroundColor: Colors.white,
        padding: 10,
        fontSize: Styles.fontNormal,
        textAlignVertical: 'top'
    },
    submitButton: {
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
    },
    cancelButton: {
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
    }
})