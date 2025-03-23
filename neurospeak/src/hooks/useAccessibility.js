import { useState, useEffect } from 'react';

/**
 * Custom hook for managing accessibility settings
 * Provides functions for text size, contrast, and other accessibility features
 */
const useAccessibility = () => {
  // Default settings
  const [textSize, setTextSize] = useState('medium'); // small, medium, large, x-large
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setTextSize(parsedSettings.textSize || 'medium');
        setHighContrast(parsedSettings.highContrast || false);
        setReducedMotion(parsedSettings.reducedMotion || false);
        setReadAloud(parsedSettings.readAloud || false);
      }
      
      // Check for system preferences
      if (window.matchMedia) {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          setReducedMotion(true);
        }
        
        // Check for contrast preference
        const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
        if (prefersContrast) {
          setHighContrast(true);
        }
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      const settings = {
        textSize,
        highContrast,
        reducedMotion,
        readAloud
      };
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }, [textSize, highContrast, reducedMotion, readAloud]);
  
  // Get appropriate text size class for Tailwind CSS
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small':
        return 'text-sm';
      case 'medium':
        return 'text-base';
      case 'large':
        return 'text-lg';
      case 'x-large':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };
  
  // Get contrast mode classes
  const getContrastClasses = () => {
    if (highContrast) {
      return {
        text: 'text-white',
        background: 'bg-black',
        border: 'border-white'
      };
    }
    return {};
  };
  
  // Get animation settings based on reduced motion preference
  const getAnimationSettings = () => {
    if (reducedMotion) {
      return {
        transition: { duration: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    
    return {
      transition: { duration: 0.3 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    };
  };
  
  // Update text size
  const updateTextSize = (size) => {
    if (['small', 'medium', 'large', 'x-large'].includes(size)) {
      setTextSize(size);
    }
  };
  
  return {
    // Current settings
    textSize,
    highContrast,
    reducedMotion,
    readAloud,
    
    // Updater functions
    updateTextSize,
    setHighContrast,
    setReducedMotion,
    setReadAloud,
    
    // Helper functions
    getTextSizeClass,
    getContrastClasses,
    getAnimationSettings
  };
};

export default useAccessibility;
