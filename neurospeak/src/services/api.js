// API service for NeuroSpeak frontend
// Handles communication with the backend server
import axios from 'axios';

const API_BASE_URL = '/api';

// Create an Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging and debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, 
      config.data ? config.data : '');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, 
      response.data ? 'Data received' : '');
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response Error:', {
        url: error.config?.url,
        message: 'No response received from server',
      });
    } else {
      // Error in setting up the request
      console.error('API Request Setup Error:', {
        url: error.config?.url,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

// Standard error handler for API calls
const handleApiError = (error) => {
  // Prepare a user-friendly error message
  let errorMessage = 'An unexpected error occurred. Please try again.';
  let statusCode = null;
  
  if (error.response) {
    // The server responded with an error status
    statusCode = error.response.status;
    
    // Use the server's error message if available
    if (error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else {
      // Generate appropriate messages based on status code
      switch (statusCode) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          errorMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          if (statusCode >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (statusCode >= 400) {
            errorMessage = 'Request error. Please try again.';
          }
      }
    }
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server. Please check your internet connection.';
  } else if (error.message) {
    // Something happened in setting up the request
    errorMessage = error.message;
  }
  
  // Return a standardized error object
  return {
    error: true,
    message: errorMessage,
    statusCode,
    timestamp: new Date().toISOString(),
    originalError: process.env.NODE_ENV === 'development' ? error.toString() : undefined
  };
};

// Authentication API
const authApi = {
  // Login user
  login: async (username, password) => {
    try {
      if (!username || !password) {
        throw new Error('Username and password are required for login');
      }
      
      const response = await apiClient.post('/auth/token', 
        new URLSearchParams({
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Register new user
  register: async (userData) => {
    try {
      if (!userData || !userData.username || !userData.password) {
        throw new Error('Username and password are required for registration');
      }
      
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Get current user profile
  getProfile: async (token) => {
    try {
      if (!token) {
        throw new Error('Token is required to get user profile');
      }
      
      const response = await apiClient.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Emoji API
const emojiApi = {
  // Record emoji interaction
  recordInteraction: async (userId, emojiId) => {
    try {
      if (!userId || !emojiId) {
        throw new Error('User ID and emoji ID are required to record interaction');
      }
      
      const response = await apiClient.post('/emoji/interaction', {
        user_id: userId,
        emoji_id: emojiId,
      });
      
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Recommendations API
const recommendationsApi = {
  // Get emoji recommendations for a user
  getRecommendations: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required for recommendations');
      }
      
      const response = await apiClient.get(`/recommendations?user_id=${encodeURIComponent(userId)}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// Text-to-Speech API
const ttsApi = {
  // Convert text to speech
  textToSpeech: async (text, voiceConfig = {}) => {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text is required for text-to-speech conversion');
      }
      
      console.log('TTS Request:', { text, ...voiceConfig });
      
      // Set a timeout specifically for TTS requests
      const response = await apiClient.post('/tts', {
        text,
        ...voiceConfig,
      }, {
        responseType: 'blob', // Important for binary data
        timeout: 15000, // 15 seconds timeout for TTS
      });
      
      // Check if we received a valid audio blob
      if (response.data.size === 0) {
        throw new Error('Received empty audio data from server');
      }
      
      // Return audio blob URL
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS Error:', error);
      
      // Return a structured error object
      return {
        error: true,
        message: error.message || 'Failed to convert text to speech',
        fallback: true
      };
    }
  },
  
  // Clean up blob URLs to prevent memory leaks
  revokeAudioUrl: (url) => {
    if (url && typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  }
};

// Speech Analysis API
const speechAnalysisApi = {
  // Analyze speech audio for pronunciation feedback
  analyzeSpeech: async (audioBlob, targetText) => {
    try {
      console.log('Analyzing speech for text:', targetText);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      // Validate inputs
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No audio data to analyze');
      }
      
      if (!targetText || targetText.trim() === '') {
        throw new Error('No target text provided for analysis');
      }
      
      // Validate audio size
      if (audioBlob.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Audio file is too large. Maximum size is 10MB.');
      }
      
      // Convert audio blob to base64
      const reader = new FileReader();
      const audioBase64Promise = new Promise((resolve, reject) => {
        reader.onload = () => {
          try {
            // Get the base64 string (remove the data URL prefix)
            const base64String = reader.result.split(',')[1];
            console.log('Successfully converted audio to base64');
            resolve(base64String);
          } catch (e) {
            console.error('Error processing FileReader result:', e);
            reject(new Error('Failed to process audio data: ' + e.message));
          }
        };
        reader.onerror = (e) => {
          console.error('FileReader error:', e);
          reject(new Error('Failed to read audio data: ' + e.target.error.message));
        };
        
        // Add a timeout for the FileReader operation
        setTimeout(() => {
          if (reader.readyState !== 2) { // DONE state
            reject(new Error('Timeout while reading audio data'));
          }
        }, 10000); // 10 second timeout
      });
      
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await audioBase64Promise;
      
      console.log('Sending audio analysis request');
      // Send the base64 audio and target text as JSON
      const response = await apiClient.post('/speech/analyze', {
        audio_base64: audioBase64,
        target_text: targetText
      }, {
        timeout: 60000 // 60 seconds timeout for speech analysis
      });
      
      console.log('Received speech analysis response:', response.data);
      
      // Validate response
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response from speech analysis service');
      }
      
      // Ensure response has required fields
      const result = response.data;
      if (!result.hasOwnProperty('score')) {
        result.score = 0;
      }
      
      if (!result.hasOwnProperty('transcription')) {
        result.transcription = '';
      }
      
      if (!Array.isArray(result.phonemeAnalysis)) {
        result.phonemeAnalysis = [];
      }
      
      if (!Array.isArray(result.suggestions)) {
        result.suggestions = ['Practice speaking more clearly and slowly.'];
      }
      
      return result;
    } catch (error) {
      console.error('Speech analysis error:', error);
      
      // Provide a graceful fallback response
      if (error.message === 'No audio data to analyze' || error.message === 'No target text provided for analysis') {
        return {
          error: true,
          message: error.message,
          transcription: '',
          score: 0,
          phonemeAnalysis: [],
          suggestions: ['Please try recording again with a clearer voice.']
        };
      }
      
      // Check for network or timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          error: true,
          message: 'The speech analysis is taking too long. Please try a shorter phrase or try again later.',
          transcription: '',
          score: 0,
          phonemeAnalysis: [],
          suggestions: ['Try recording a shorter phrase.', 'Ensure your internet connection is stable.']
        };
      }
      
      return {
        ...handleApiError(error),
        transcription: '',
        score: 0,
        phonemeAnalysis: [],
        suggestions: ['There was an error analyzing your speech. Please try again.']
      };
    }
  },
  
  // Get speech exercises for therapy
  getExercises: async (difficulty = null, category = null) => {
    try {
      let url = '/speech/exercises';
      const params = [];
      
      if (difficulty) params.push(`difficulty=${encodeURIComponent(difficulty)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      console.log('Fetching exercises with URL:', url);
      const response = await apiClient.get(url);
      
      // Validate response
      if (!Array.isArray(response.data)) {
        console.error('Invalid exercises response format:', response.data);
        return {
          error: true,
          message: 'Received invalid exercises data from server',
          statusCode: 200
        };
      }
      
      // Ensure each exercise has required fields
      const validatedExercises = response.data.map(exercise => ({
        id: exercise.id || `exercise_${Math.random().toString(36).substr(2, 9)}`,
        title: exercise.title || 'Untitled Exercise',
        text: exercise.text || '',
        difficulty: exercise.difficulty || 'medium',
        category: exercise.category || 'general',
        ...exercise
      }));
      
      return validatedExercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return handleApiError(error);
    }
  },
  
  // Save user's speech therapy progress
  saveProgress: async (userId, exerciseId, score) => {
    try {
      if (!userId) {
        throw new Error('User ID is required to save progress');
      }
      
      if (!exerciseId) {
        throw new Error('Exercise ID is required to save progress');
      }
      
      if (typeof score !== 'number' || score < 0 || score > 100) {
        throw new Error('Valid score (0-100) is required to save progress');
      }
      
      console.log('Saving progress:', { userId, exerciseId, score });
      const response = await apiClient.post('/speech/progress', {
        user_id: userId,
        exercise_id: exerciseId,
        score: score
      });
      
      return response.data;
    } catch (error) {
      console.error('Error saving progress:', error);
      return handleApiError(error);
    }
  }
};

// Export all API services
const apiService = {
  auth: authApi,
  emoji: emojiApi,
  recommendations: recommendationsApi,
  tts: ttsApi,
  speechAnalysis: speechAnalysisApi,
};

export default apiService;
