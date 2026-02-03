import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for regular user
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                setUser(JSON.parse(userInfo));
            } catch (error) {
                console.error("Failed to parse user info:", error);
                localStorage.removeItem('userInfo');
            }
        }
        
        // Check for admin user
        const token = localStorage.getItem('token');
        const adminInfo = localStorage.getItem('adminInfo');
        if (token && adminInfo) {
            try {
                setUser({ ...JSON.parse(adminInfo), isAdmin: true });
            } catch (error) {
                console.error("Failed to parse admin info:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('adminInfo');
            }
        }
        
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Try admin login first (try with both email and username)
            try {
                const { data } = await axios.post('http://localhost:5000/api/admin/auth/login', { 
                    email: username, 
                    password 
                });
                
                // Store admin token and info
                localStorage.setItem('token', data.token);
                localStorage.setItem('adminInfo', JSON.stringify(data.admin));
                setUser({ ...data.admin, isAdmin: true });
                return { success: true, isAdmin: true };
            } catch (adminError) {
                console.log('Admin login failed, trying regular user login...');
                // If admin login fails, try regular user login
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                const { data } = await axios.post('http://localhost:5000/api/auth/login', { username, password }, config);

                localStorage.setItem('userInfo', JSON.stringify(data));
                setUser(data);
                return { success: true, isAdmin: false };
            }
        } catch (error) {
            // Handle different error scenarios
            let errorMessage = 'Invalid username or password';
            
            if (error.response) {
                // Server responded with error
                if (error.response.status === 401) {
                    errorMessage = 'Invalid username or password';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                // Request made but no response
                errorMessage = 'Cannot connect to server. Please check your connection.';
            } else {
                // Something else happened
                errorMessage = 'An error occurred. Please try again.';
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        localStorage.removeItem('adminInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
