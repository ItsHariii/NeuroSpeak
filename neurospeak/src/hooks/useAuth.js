import { useState, useEffect, useCallback, createContext } from 'react';
import apiService from '../services/api';

// Create context for auth state
const AuthContext = createContext(null);

// Provider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token and get user profile
          const userProfile = await apiService.auth.getProfile(token);
          if (!userProfile.error) {
            setUser(userProfile);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('authToken');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.auth.login(username, password);
      
      if (response.error) {
        throw new Error(response.message || 'Login failed');
      }
      
      // Store token
      localStorage.setItem('authToken', response.access_token);
      
      // Get user profile
      const userProfile = await apiService.auth.getProfile(response.access_token);
      setUser(userProfile);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Register function
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.auth.register(userData);
      
      if (response.error) {
        throw new Error(response.message || 'Registration failed');
      }
      
      // Auto-login after registration
      return await login(userData.username, userData.password);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [login]);
  
  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);
  
  // For guest mode
  const loginAsGuest = useCallback(() => {
    const guestUser = {
      id: 'guest',
      username: 'Guest User',
      role: 'guest',
      isGuest: true
    };
    setUser(guestUser);
    return { success: true };
  }, []);
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loginAsGuest,
    isAuthenticated: !!user && !user.isGuest,
    isGuest: user?.isGuest || false
  };
  
  // Use a non-JSX return for a .js file
  return {
    Provider: AuthContext.Provider,
    value
  };
};

// Mock implementation for standalone use
const useAuth = () => {
  // For standalone use without the AuthProvider
  const [user, setUser] = useState(null);
  
  // Provide a simplified mock implementation
  return {
    user: user || { id: 'guest', username: 'Guest User', isGuest: true },
    loading: false,
    error: null,
    login: () => console.log('Login not implemented in standalone mode'),
    register: () => console.log('Register not implemented in standalone mode'),
    logout: () => setUser(null),
    loginAsGuest: () => setUser({ id: 'guest', username: 'Guest User', isGuest: true }),
    isAuthenticated: false,
    isGuest: true
  };
};

export default useAuth;
