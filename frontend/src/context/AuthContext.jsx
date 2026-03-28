import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Determine user login based on token in local storage
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);

                // Check if token expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    // Fetch user profile from backend
                    fetchUserProfile(token);
                }
            } catch (error) {
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            // We assume backend runs on 5000 and the route is setup
            const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
            const userWithToken = { ...data, token };
            setUser(userWithToken);
            localStorage.setItem('user', JSON.stringify(userWithToken));
        } catch (error) {
            console.error('Error fetching user profile', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const { data } = await axios.post('http://localhost:5000/api/users/register', userData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
