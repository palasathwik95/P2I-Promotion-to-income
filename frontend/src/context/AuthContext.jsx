import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set default baseURL for api requests
    axios.defaults.baseURL = 'http://localhost:8080';

    // Restore session on startup
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchCurrentUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCurrentUser = async (token) => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data);
        } catch (err) {
            console.error('Session restored failed, logging out', err);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token } = response.data;

            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Fetch fresh details with profile info
            const meResponse = await axios.get('/api/auth/me');
            setUser(meResponse.data);
            setLoading(false);
            return meResponse.data;
        } catch (err) {
            setLoading(false);
            throw err;
        }
    };

    const register = async (signUpData) => {
        try {
            const response = await axios.post('/api/auth/register', signUpData);
            return response.data;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
