import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    // Configure axios to always send the token
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            // In a real app, you'd fetch the user profile here using the token
            // For now, we decode or assume user details are set during login
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token]);

    useEffect(() => {
        // Load user from local storage on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken('');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
