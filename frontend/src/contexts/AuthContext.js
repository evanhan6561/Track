import React, { createContext, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useEffect } from 'react';

export const AuthContext = createContext();

const AuthContextProvider = (props) => {
    const [loggedIn, setLoggedIn] = useState(false);

    // Check if we're logged in on startup
    const {data, loading} = useFetch('/api/loggedIn');

    // If we're done loading an
    useEffect(() => {
        if (!loading && data.loggedIn) {
            console.log('Auth Context Auto Login:', data, loading);
            setLoggedIn(true);
        }
    }, [data, loading]);
    return (
        <AuthContext.Provider value={{ loggedIn: loggedIn, setLoggedIn: setLoggedIn }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;