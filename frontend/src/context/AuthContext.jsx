import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('comply_token');
    const storedUser = localStorage.getItem('comply_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('comply_token', data.token);
        localStorage.setItem('comply_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Unable to connect to the compliance server.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('comply_token');
    localStorage.removeItem('comply_user');
  };

  // Helper function to perform authenticated API calls
  const authFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set headers
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const activeToken = token || localStorage.getItem('comply_token');
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Auto logout if session has expired on backend
      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Session expired or unauthorized');
      }

      return response;
    } catch (err) {
      console.error(`authFetch Error at ${endpoint}:`, err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, API_BASE_URL }}>
      {!loading && children}
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
export default AuthContext;
