import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AccessibilityContext = createContext();

// Provider component
export const AccessibilityProvider = ({ children }) => {
  // State for accessibility settings
  const [highContrast, setHighContrast] = useState(false);
  const [textSize, setTextSize] = useState('medium'); // 'small', 'medium', 'large'
  const [audioFeedback, setAudioFeedback] = useState(true);
  
  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const { highContrast, textSize, audioFeedback } = JSON.parse(savedSettings);
      setHighContrast(highContrast);
      setTextSize(textSize);
      setAudioFeedback(audioFeedback);
    }
  }, []);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    const settings = { highContrast, textSize, audioFeedback };
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply settings to document
    document.documentElement.classList.toggle('high-contrast', highContrast);
    document.documentElement.dataset.textSize = textSize;
  }, [highContrast, textSize, audioFeedback]);
  
  // Get text size class
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small':
        return 'text-base';
      case 'medium':
        return 'text-lg';
      case 'large':
        return 'text-xl';
      default:
        return 'text-lg';
    }
  };
  
  // Context value
  const value = {
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    audioFeedback,
    setAudioFeedback,
    getTextSizeClass
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use the accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;
