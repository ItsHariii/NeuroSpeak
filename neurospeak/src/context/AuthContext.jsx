import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('neuroSpeakUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = (email, password) => {
    // In a real app, this would be an API call to authenticate
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // For demo purposes, accept any email/password
        const user = {
          id: '1',
          name: email.split('@')[0],
          email,
          profilePicture: null,
          preferences: {
            textSize: 'medium',
            audioFeedback: true,
            highContrast: false,
            customCategories: [],
            // User stats for homepage
            streak: 7,
            streakChange: 2,
            wordsLearned: 124,
            wordsLearnedChange: 12,
            dailyFocus: "Practice communication skills for 10 minutes"
          }
        };
        
        // Store user in localStorage
        localStorage.setItem('neuroSpeakUser', JSON.stringify(user));
        setCurrentUser(user);
        resolve(user);
      }, 1000);
    });
  };

  // Signup function
  const signup = (name, email, password) => {
    // In a real app, this would be an API call to create a new user
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        const user = {
          id: Date.now().toString(),
          name,
          email,
          profilePicture: null,
          preferences: {
            textSize: 'medium',
            audioFeedback: true,
            highContrast: false,
            customCategories: [],
            // Initial user stats for homepage
            streak: 0,
            streakChange: 0,
            wordsLearned: 0,
            wordsLearnedChange: 0,
            dailyFocus: "Start your communication journey today!"
          }
        };
        
        // Store user in localStorage
        localStorage.setItem('neuroSpeakUser', JSON.stringify(user));
        setCurrentUser(user);
        resolve(user);
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('neuroSpeakUser');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = (userData) => {
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('neuroSpeakUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  // Update user preferences
  const updatePreferences = (preferences) => {
    const updatedUser = { 
      ...currentUser, 
      preferences: {
        ...currentUser.preferences,
        ...preferences
      }
    };
    localStorage.setItem('neuroSpeakUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    updatePreferences,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
