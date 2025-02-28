import React, { useEffect, useState, createContext, useContext } from 'react'

type UserData = {
    favorite?: any,
    phoneNumber: string,
    inbox: any,
    settings: any,
    unbanTime?: number
}

type ContainerContext = {
    user: any,
    setUser: React.Dispatch<React.SetStateAction<any>>
    userUid: string,
    setUserUid: React.Dispatch<React.SetStateAction<string>>,
    userData: UserData, 
    setUserData: React.Dispatch<React.SetStateAction<UserData>>, 
    page: string, 
    setPage: React.Dispatch<React.SetStateAction<string>>,
    capturedImageUri: string,
    setCapturedImageUri: React.Dispatch<React.SetStateAction<string>>,
    respondingTo: string,
    setRespondingTo: React.Dispatch<React.SetStateAction<string>>,
    isLogoutMode: boolean,
    setLogoutMode: React.Dispatch<React.SetStateAction<boolean>>
}

// initial value provided here is what you get if you try to consume context outside of the provider
const ContainerContext = createContext<ContainerContext | null>(null)

export const ContainerContextProvider = (props: any) => {
    const [user, setUser] = useState<any>(null)
    const [userUid, setUserUid] = useState<any>(null)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [page, setPage] = useState<string>('CameraPage')
    const [capturedImageUri, setCapturedImageUri] = useState<string>('')
    const [respondingTo, setRespondingTo] = useState<string>('')
    const [isLogoutMode, setLogoutMode] = useState<boolean>(false)

    const value = {
        user,
        setUser,
        userUid,
        setUserUid,
        userData,
        setUserData,
        page,
        setPage,
        capturedImageUri,
        setCapturedImageUri,
        respondingTo,
        setRespondingTo,
        isLogoutMode,
        setLogoutMode
    }

    useEffect(() => {
        console.log('user changed:', user)
    }, [user])

    useEffect(() => {
        console.log('userUid changed:', userUid)
    }, [userUid])

    return <ContainerContext.Provider value={value} {...props}/>
}

export const useContainerContext = () => {
    const context = useContext(ContainerContext)
    if (!context) {
        throw new Error('useContainerContext must be used within a ContextProvider')
    }
    return context
}
