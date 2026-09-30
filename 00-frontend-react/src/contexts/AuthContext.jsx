import { createContext, useState } from 'react';

const initialAuth = {
    isAuthenticated: false,
    user: {
        email: "",
        username: "",
        phonenumber: "",
        gender: "",
        nationality: ""
    }
};

export const AuthContext = createContext({
    auth: initialAuth,
    setAuth: () => {},
    authLoading: true,
    setAuthLoading: () => {},
    authError: null,
    setAuthError: () => {}
});

export const AuthWrapper = ({ children }) => {
    const [authLoading, setAuthLoading] = useState(() => !!localStorage.getItem('access_token'));
    const [authError, setAuthError] = useState(null);
    const [auth, setAuth] = useState(initialAuth);

    return (
        <AuthContext.Provider value={{ auth, setAuth, authLoading, setAuthLoading, authError, setAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};
