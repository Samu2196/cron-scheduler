import { useState } from 'react'

export const useAlert = () => {
    const [alert, setAlert] = useState({
        visible: false,
        message: '',
        onAccept: null,
    })

    const showAlert = (message, onAccept = null) => {
        setAlert({
            visible: true,
            message,
            onAccept,
        })
    }

    const hideAlert = () => {
        setAlert({
            ...alert,
            visible: false,
        })
    }

    return { alert, showAlert, hideAlert };
}
