import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import useSpeech from '../hooks/useSpeech';

// Create a context to share speech recognition state across components
const SpeechContext = createContext();

export const SpeechProvider = ({ children }) => {
  // Track which component is currently using speech recognition
  const [activeComponent, setActiveComponent] = useState(null);
  const [isMediaRecorderActive, setIsMediaRecorderActive] = useState(false);
  
  // Use the existing useSpeech hook
  const speechHook = useSpeech();
  
  // Create a ref for MediaRecorder
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  
  // Clean up resources when unmounting
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          console.error('Error stopping MediaRecorder:', err);
        }
      }
    };
  }, []);
  
  // Function to request MediaRecorder access
  const requestMediaRecorder = async (componentId, options = {}) => {
    // If another component is using MediaRecorder, release it first
    if (isMediaRecorderActive && activeComponent !== componentId) {
      releaseMediaRecorder(activeComponent);
    }
    
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      // Update state
      setActiveComponent(componentId);
      setIsMediaRecorderActive(true);
      
      return { recorder, stream };
    } catch (error) {
      console.error('Error creating MediaRecorder:', error);
      return { error };
    }
  };
  
  // Function to release MediaRecorder
  const releaseMediaRecorder = (componentId) => {
    if (activeComponent !== componentId) return;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
      }
    }
    
    mediaRecorderRef.current = null;
    setActiveComponent(null);
    setIsMediaRecorderActive(false);
  };
  
  // Expose the context value
  const contextValue = {
    ...speechHook,
    requestMediaRecorder,
    releaseMediaRecorder,
    isMediaRecorderActive,
    activeComponent
  };
  
  return (
    <SpeechContext.Provider value={contextValue}>
      {children}
    </SpeechContext.Provider>
  );
};

// Custom hook to use the speech context
export const useSpeechContext = () => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeechContext must be used within a SpeechProvider');
  }
  return context;
};

export default SpeechContext;
