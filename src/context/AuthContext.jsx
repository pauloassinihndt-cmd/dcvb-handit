import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('is_auth') === 'true';
    });
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('auth_user');
        return saved ? JSON.parse(saved) : null;
    });

    const login = useCallback(async (password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password })
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data.user);
                localStorage.setItem('is_auth', 'true');
                localStorage.setItem('auth_user', JSON.stringify(data.user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('is_auth');
        localStorage.removeItem('auth_user');
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
