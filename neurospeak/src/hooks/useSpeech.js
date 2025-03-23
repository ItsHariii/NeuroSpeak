import { useState, useCallback } from 'react';

const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Check if speech synthesis is available
  const speechSynthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Check if speech recognition is available
  const SpeechRecognition = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const speechRecognitionAvailable = !!SpeechRecognition;
  
  // Speak text function
  const speak = useCallback((text, options = {}) => {
    if (!speechSynthesisAvailable) {
      console.warn('Speech synthesis not available');
      return false;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set default options for clarity
    utterance.rate = options.rate || 0.9; // Slightly slower for clarity
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    // Optional voice selection
    if (options.voice) {
      utterance.voice = options.voice;
    }
    
    // Events
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
    return true;
  }, [speechSynthesisAvailable]);
  
  // Get available voices
  const getVoices = useCallback(() => {
    if (!speechSynthesisAvailable) return [];
    return window.speechSynthesis.getVoices();
  }, [speechSynthesisAvailable]);
  
  // Speech recognition functionality
  const [recognition, setRecognition] = useState(null);
  
  const startListening = useCallback((options = {}) => {
    if (!speechRecognitionAvailable) {
      console.warn('Speech recognition not available');
      return false;
    }
    
    const newRecognition = new SpeechRecognition();
    
    // Configure
    newRecognition.continuous = options.continuous || false;
    newRecognition.interimResults = options.interimResults || false;
    newRecognition.lang = options.lang || 'en-US';
    
    // Events
    newRecognition.onstart = () => setIsListening(true);
    newRecognition.onend = () => setIsListening(false);
    newRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
    };
    
    // Result handler needs to be set by the component using this hook
    if (options.onResult) {
      newRecognition.onresult = options.onResult;
    }
    
    newRecognition.start();
    setRecognition(newRecognition);
    return true;
  }, [speechRecognitionAvailable, SpeechRecognition]);
  
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      return true;
    }
    return false;
  }, [recognition]);
  
  return {
    speak,
    getVoices,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    speechSynthesisAvailable,
    speechRecognitionAvailable
  };
};

export default useSpeech;
