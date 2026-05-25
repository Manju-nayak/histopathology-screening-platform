import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Decodes JWT payload using standard base64 decoding natively
  const decodeToken = (jwtToken) => {
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode auth token:", e);
      return null;
    }
  };

  useEffect(() => {
    // Attempt to recover active session on application load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      const payload = decodeToken(storedToken);
      // Check if token is expired
      if (payload && payload.exp * 1000 > Date.now()) {
        setToken(storedToken);
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // Fallback if user profile wasn't serialized
          setUser({ id: payload.sub, email: "clinician@cancerplatform.com", role: "doctor" });
        }
      } else {
        // Clear expired token session
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      const payload = decodeToken(access_token);
      
      // Since backend doesn't return full details, we estimate role from payload or email
      // Seed details (real production apps fetch /users/me after this)
      const mockUserObj = {
        id: payload ? payload.sub : 99,
        email: email,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: email.includes('admin') ? 'admin' : 'doctor'
      };

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(mockUserObj));
      
      setToken(access_token);
      setUser(mockUserObj);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.error("Login attempt failed:", error);
      const message = error.response?.data?.detail || "Invalid login credentials.";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName, email, password, role = 'doctor') => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        role
      });
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error.response?.data?.detail || "Registration failed. Email might be already in use.";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
