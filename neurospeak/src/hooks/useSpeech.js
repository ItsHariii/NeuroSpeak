import { useState, useCallback, useEffect, useRef } from 'react';

const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  const [error, setError] = useState(null);
  
  // Refs to track instances across renders
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  
  // Check if speech synthesis is available
  const speechSynthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Check if speech recognition is available
  const SpeechRecognition = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );
  const speechRecognitionAvailable = !!SpeechRecognition;
  
  // Load voices when the component mounts
  useEffect(() => {
    if (!speechSynthesisAvailable) return;
    
    // Function to load and set voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        console.log(`Loaded ${availableVoices.length} voices`);
        setVoices(availableVoices);
      }
    };
    
    // Load voices immediately (for Chrome)
    loadVoices();
    
    // Set up event listener for voiceschanged (for Firefox/Safari)
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSynthesisAvailable, isSpeaking]);
  
  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.error('Error stopping recognition on cleanup:', err);
        }
      }
    };
  }, [isListening]);
  
  // Speak text function with improved error handling
  const speak = useCallback((text, options = {}) => {
    if (!speechSynthesisAvailable) {
      console.warn('Speech synthesis not available');
      setError('Speech synthesis is not supported in this browser');
      return false;
    }
    
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.warn('Empty or invalid text provided to speak function');
      return false;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Set default options for clarity
      utterance.rate = options.rate || 0.9; // Slightly slower for clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      utterance.lang = options.lang || 'en-US';
      
      // Optional voice selection
      if (options.voice) {
        utterance.voice = options.voice;
      } else if (options.voiceName && voices.length > 0) {
        // Find voice by name
        const matchedVoice = voices.find(v => 
          v.name.toLowerCase().includes(options.voiceName.toLowerCase())
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
      
      // Events
      utterance.onstart = () => {
        console.log('Speech started');
        setIsSpeaking(true);
        setError(null);
        if (options.onStart) options.onStart();
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
        if (options.onEnd) options.onEnd();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setError(`Speech synthesis error: ${event.error}`);
        if (options.onError) options.onError(event);
      };
      
      // Speak the utterance
      window.speechSynthesis.speak(utterance);
      
      // Chrome bug workaround: speech can sometimes cut off
      if (window.chrome) {
        const resumeInfinity = setInterval(() => {
          if (!isSpeaking) {
            clearInterval(resumeInfinity);
            return;
          }
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 10000);
        
        utterance.onend = () => {
          clearInterval(resumeInfinity);
          setIsSpeaking(false);
          if (options.onEnd) options.onEnd();
        };
      }
      
      return true;
    } catch (err) {
      console.error('Error in speak function:', err);
      setError(`Speech synthesis error: ${err.message}`);
      setIsSpeaking(false);
      return false;
    }
  }, [speechSynthesisAvailable, voices, isSpeaking]);
  
  // Cancel ongoing speech
  const cancelSpeech = useCallback(() => {
    if (!speechSynthesisAvailable) return false;
    
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return true;
    } catch (err) {
      console.error('Error cancelling speech:', err);
      return false;
    }
  }, [speechSynthesisAvailable]);
  
  // Get available voices
  const getVoices = useCallback(() => {
    if (!speechSynthesisAvailable) return [];
    return voices;
  }, [speechSynthesisAvailable, voices]);
  
  // Speech recognition functionality with improved error handling
  const startListening = useCallback((options = {}) => {
    if (!speechRecognitionAvailable) {
      console.warn('Speech recognition not available');
      setError('Speech recognition is not supported in this browser');
      return false;
    }
    
    try {
      // Stop any existing recognition
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      
      // Create new recognition instance
      const newRecognition = new SpeechRecognition();
      recognitionRef.current = newRecognition;
      
      // Configure
      newRecognition.continuous = options.continuous || false;
      newRecognition.interimResults = options.interimResults || false;
      newRecognition.lang = options.lang || 'en-US';
      newRecognition.maxAlternatives = options.maxAlternatives || 1;
      
      // Events
      newRecognition.onstart = () => {
        console.log('Recognition started');
        setIsListening(true);
        setError(null);
        if (options.onStart) options.onStart();
      };
      
      newRecognition.onend = () => {
        console.log('Recognition ended');
        setIsListening(false);
        if (options.onEnd) options.onEnd();
      };
      
      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error';
        if (event.error === 'no-speech') {
          errorMessage = 'No speech detected. Please try again.';
        } else if (event.error === 'audio-capture') {
          errorMessage = 'No microphone detected or microphone is not working.';
        } else if (event.error === 'not-allowed') {
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
        } else if (event.error === 'network') {
          errorMessage = 'Network error occurred. Please check your internet connection.';
        } else if (event.error === 'aborted') {
          errorMessage = 'Speech recognition was aborted.';
        } else {
          errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
        if (options.onError) options.onError(event, errorMessage);
      };
      
      // Result handler needs to be set by the component using this hook
      if (options.onResult) {
        newRecognition.onresult = options.onResult;
      }
      
      // Start recognition
      newRecognition.start();
      
      // Set timeout to automatically stop if it runs too long
      if (options.timeout && options.timeout > 0) {
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            stopListening();
            if (options.onTimeout) options.onTimeout();
          }
        }, options.timeout);
      }
      
      return true;
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError(`Speech recognition error: ${err.message}`);
      setIsListening(false);
      return false;
    }
  }, [speechRecognitionAvailable, SpeechRecognition, isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        return true;
      } catch (err) {
        console.error('Error stopping recognition:', err);
        setError(`Error stopping recognition: ${err.message}`);
        return false;
      }
    }
    return false;
  }, []);
  
  return {
    speak,
    cancelSpeech,
    getVoices,
    voices,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    speechSynthesisAvailable,
    speechRecognitionAvailable,
    error,
    clearError: () => setError(null)
  };
};

export default useSpeech;
