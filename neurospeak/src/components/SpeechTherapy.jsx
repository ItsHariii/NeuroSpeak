import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useSpeechContext } from '../context/SpeechContext';

const SpeechTherapy = () => {
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [category, setCategory] = useState('general');
  const [score, setScore] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  
  const audioChunksRef = useRef([]);
  
  const { 
    speak, 
    cancelSpeech, 
    isSpeaking, 
    error: speechError, 
    clearError: clearSpeechError,
    requestMediaRecorder,
    releaseMediaRecorder
  } = useSpeechContext();
  
  // Component ID for SpeechContext
  const COMPONENT_ID = 'speech-therapy';
  
  // Clear speech errors when component unmounts
  useEffect(() => {
    return () => {
      if (speechError) clearSpeechError();
      if (isSpeaking) cancelSpeech();
      releaseMediaRecorder(COMPONENT_ID);
    };
  }, [speechError, clearSpeechError, isSpeaking, cancelSpeech, releaseMediaRecorder]);
  
  // Update error state when speech error occurs
  useEffect(() => {
    if (speechError) {
      setError(speechError);
    }
  }, [speechError]);
  
  // Fetch exercises when component mounts or difficulty/category changes
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching exercises with difficulty: ${difficulty}, category: ${category}`);
        const data = await apiService.speechAnalysis.getExercises(difficulty, category);
        
        if (data.error) {
          console.error('Error in API response:', data);
          setError(`Failed to load exercises: ${data.message}`);
          setExercises([]);
          setCurrentExercise(null);
          return;
        }
        
        console.log(`Received ${data.length} exercises`);
        setExercises(data);
        if (data.length > 0) {
          setCurrentExercise(data[0]);
        } else {
          setCurrentExercise(null);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setError('Failed to load exercises. Please try again later.');
        setExercises([]);
        setCurrentExercise(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, [difficulty, category]);
  
  // Cleanup recording resources when component unmounts
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  // Start recording audio
  const startRecording = async () => {
    try {
      setError(null);
      console.log('Requesting microphone access...');
      
      // First, ensure any previous recording is properly stopped
      stopRecording();
      
      const mediaRecorder = await requestMediaRecorder(COMPONENT_ID);
      
      // Reset audio chunks and state
      audioChunksRef.current = [];
      setAudioURL(null);
      setFeedback(null);
      setScore(null);
      
      try {
        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log(`Recorded audio chunk: ${event.data.size} bytes`);
          }
        };
        
        // Handle recording stop event
        mediaRecorder.onstop = () => {
          console.log('Recording stopped');
          
          // Clear recording timer
          if (recordingTimer) {
            clearInterval(recordingTimer);
            setRecordingTimer(null);
          }
          
          // Check if we have audio data
          if (audioChunksRef.current.length === 0) {
            setError('No audio data was recorded. Please try again.');
            setIsRecording(false);
            return;
          }
          
          // Create blob from audio chunks
          const audioBlob = new Blob(audioChunksRef.current);
          console.log(`Total recording size: ${audioBlob.size} bytes`);
          
          if (audioBlob.size < 1000) {
            setError('Recording too short. Please try again and speak clearly.');
            setIsRecording(false);
            return;
          }
          
          // Create URL for audio blob
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          
          // Analyze the speech
          analyzeSpeech(audioBlob);
        };
        
        // Handle recording error
        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event.error);
          setError(`Recording error: ${event.error?.message || 'Unknown error'}`);
          setIsRecording(false);
        };
        
        // Start recording
        mediaRecorder.start(1000); // Collect data in 1-second chunks
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer to track recording duration
        const timer = setInterval(() => {
          setRecordingTime(prevTime => {
            const newTime = prevTime + 1;
            // Auto-stop after 30 seconds to prevent very long recordings
            if (newTime >= 30 && mediaRecorder.state === 'recording') {
              stopRecording();
            }
            return newTime;
          });
        }, 1000);
        
        setRecordingTimer(timer);
        
      } catch (error) {
        console.error('Error creating MediaRecorder:', error);
        setError('Could not create media recorder. Please try again.');
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      let errorMessage = 'Could not access microphone. Please check permissions and try again.';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      }
      
      setError(errorMessage);
      setIsRecording(false);
    }
  };
  
  // Stop recording audio
  const stopRecording = () => {
    try {
      // Clear recording timer
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      
      // Stop media recorder if it exists and is recording
      const mediaRecorder = requestMediaRecorder(COMPONENT_ID);
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        console.log('Media recorder stopped');
      }
      
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Error stopping recording. Please refresh the page and try again.');
      setIsRecording(false);
    }
  };
  
  // Analyze speech recording
  const analyzeSpeech = async (audioBlob) => {
    if (!currentExercise) {
      setError('No exercise selected. Please select an exercise first.');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setFeedback(null);
      setError(null);
      
      console.log(`Analyzing speech for exercise: ${currentExercise.title}`);
      console.log(`Target text: ${currentExercise.text}`);
      console.log(`Audio blob size: ${audioBlob.size} bytes`);
      
      // Check if the audio is too small (likely no speech)
      if (audioBlob.size < 5000) {
        console.warn('Audio file too small, likely no speech detected');
        setFeedback({
          transcription: '',
          score: 0,
          phonemeAnalysis: [],
          suggestions: ['No speech detected. Please try again and speak clearly.']
        });
        setScore(0);
        setIsAnalyzing(false);
        return;
      }
      
      // Send audio to backend for analysis
      const result = await apiService.speechAnalysis.analyzeSpeech(audioBlob, currentExercise.text);
      
      if (result.error) {
        console.error('Error in speech analysis response:', result);
        setError(`Analysis failed: ${result.message}`);
        setIsAnalyzing(false);
        return;
      }
      
      console.log('Analysis result:', result);
      
      // Validate the transcription - if empty or too short, treat as no speech detected
      if (!result.transcription || result.transcription.trim().length < 2) {
        console.warn('Empty or too short transcription returned from analysis');
        setFeedback({
          transcription: '',
          score: 0,
          phonemeAnalysis: [],
          suggestions: ['No speech detected. Please try again and speak clearly.']
        });
        setScore(0);
        setIsAnalyzing(false);
        return;
      }
      
      // Set feedback and score
      setFeedback(result);
      setScore(result.score);
      
      // Save progress if user is logged in
      // This is a placeholder - you would need to get the actual user ID
      
    } catch (error) {
      console.error('Error analyzing speech:', error);
      setError(`Analysis failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Move to the next exercise
  const nextExercise = () => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExercise.id);
    if (currentIndex < exercises.length - 1) {
      setCurrentExercise(exercises[currentIndex + 1]);
      resetExercise();
    }
  };
  
  // Move to the previous exercise
  const prevExercise = () => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExercise.id);
    if (currentIndex > 0) {
      setCurrentExercise(exercises[currentIndex - 1]);
      resetExercise();
    }
  };
  
  // Reset the current exercise state
  const resetExercise = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setFeedback(null);
    setScore(null);
    setError(null);
  };
  
  // Play the reference audio for the current exercise
  const playReferenceAudio = async () => {
    if (!currentExercise) return;
    
    try {
      setLoading(true);
      setError(null);
      console.log(`Playing reference audio for: ${currentExercise.text}`);
      
      // First try using the enhanced speech synthesis with options
      const speechOptions = {
        rate: 0.9, // Slightly slower for clarity
        pitch: 1,
        lang: 'en-US',
        onStart: () => console.log('Speech started'),
        onEnd: () => console.log('Speech ended'),
        onError: (err) => {
          console.error('Speech synthesis error:', err);
          fallbackToTtsApi();
        }
      };
      
      // Try to use browser speech synthesis first
      if (speak(currentExercise.text, speechOptions)) {
        console.log('Using browser speech synthesis');
        setLoading(false);
        return;
      }
      
      // Fallback to API-based TTS if browser speech synthesis fails
      fallbackToTtsApi();
      
    } catch (error) {
      console.error('Error playing reference audio:', error);
      setError(`Could not play audio: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };
  
  // Fallback to API-based TTS
  const fallbackToTtsApi = async () => {
    try {
      console.log('Browser speech synthesis failed, falling back to API');
      
      // Fallback to API-based TTS
      const audioUrl = await apiService.tts.textToSpeech(currentExercise.text);
      
      if (typeof audioUrl === 'object' && audioUrl.error) {
        throw new Error(audioUrl.message || 'TTS service error');
      }
      
      // Play the audio with improved error handling
      const audio = new Audio(audioUrl);
      
      // Set up error handling
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio. Please try again.');
      };
      
      // Set up audio playback
      audio.oncanplaythrough = () => {
        console.log('Audio ready to play');
        audio.play().catch(e => {
          console.error('Audio play error:', e);
          setError('Failed to play audio. Please try again.');
        });
      };
      
      // Clean up audio URL when done to prevent memory leaks
      audio.onended = () => {
        if (audioUrl.startsWith('blob:')) {
          apiService.tts.revokeAudioUrl(audioUrl);
        }
      };
    } catch (error) {
      console.error('Error in TTS API fallback:', error);
      setError(`Could not play audio: ${error.message || 'TTS service unavailable'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Render difficulty selector
  const renderDifficultySelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="w-full p-2 border rounded-md"
        disabled={loading}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
    </div>
  );
  
  // Render category selector
  const renderCategorySelector = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded-md"
        disabled={loading}
      >
        <option value="general">General</option>
        <option value="daily">Daily Phrases</option>
        <option value="medical">Medical</option>
        <option value="emergency">Emergency</option>
      </select>
    </div>
  );
  
  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-red-100 text-red-700 rounded-md"
      >
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </motion.div>
    );
  };
  
  // Render feedback
  const renderFeedback = () => {
    if (!feedback) return null;
    
    if (feedback.error) {
      return (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{feedback.message}</p>
        </div>
      );
    }
    
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-gray-100 rounded-md"
      >
        <h3 className="font-bold text-lg mb-2">Pronunciation Feedback</h3>
        <div className="mb-2">
          <span className="font-medium">Score: </span>
          <span className={`font-bold ${scoreColor}`}>{score}%</span>
        </div>
        
        <div className="mb-2">
          <h4 className="font-medium">What we heard:</h4>
          <p className="italic">{feedback.transcription || 'No transcription available'}</p>
        </div>
        
        {feedback.phonemeAnalysis && feedback.phonemeAnalysis.length > 0 ? (
          <div className="mb-2">
            <h4 className="font-medium">Word-by-word analysis:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {feedback.phonemeAnalysis.map((item, index) => (
                <div 
                  key={index} 
                  className={`px-2 py-1 rounded-md text-sm ${
                    item.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  <span className="font-medium">{item.phoneme}</span>
                  {!item.correct && (
                    <span className="text-xs block">{item.feedback}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-2">
            <h4 className="font-medium">Word-by-word analysis:</h4>
            <p className="text-gray-500">No detailed analysis available</p>
          </div>
        )}
        
        {feedback.suggestions && feedback.suggestions.length > 0 ? (
          <div>
            <h4 className="font-medium">Suggestions:</h4>
            <ul className="list-disc pl-5">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <h4 className="font-medium">Suggestions:</h4>
            <p className="text-gray-500">No suggestions available</p>
          </div>
        )}
      </motion.div>
    );
  };
  
  // Main render
  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Speech Therapy</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          {renderDifficultySelector()}
          {renderCategorySelector()}
        </div>
        
        <div className="md:col-span-2">
          {loading && (
            <div className="text-center py-4 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          )}
          
          {renderError()}
          
          {currentExercise && !loading && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{currentExercise.title || 'Practice Exercise'}</h2>
              
              <div className="mb-6">
                <p className="text-lg font-medium mb-2">Say this phrase:</p>
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-xl">{currentExercise.text}</p>
                </div>
                <button
                  onClick={playReferenceAudio}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06z" />
                    <path d="M18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                    <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
                  </svg>
                  Listen to Correct Pronunciation
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center disabled:bg-green-300 disabled:cursor-not-allowed"
                      disabled={isAnalyzing || loading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                      </svg>
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                      </svg>
                      Stop Recording {recordingTime > 0 && `(${recordingTime}s)`}
                    </button>
                  )}
                </div>
                
                {isAnalyzing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-md flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-medium">Analyzing your pronunciation...</p>
                  </div>
                )}
                
                {audioURL && !isAnalyzing && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Your recording:</p>
                    <audio src={audioURL} controls className="w-full" />
                  </div>
                )}
              </div>
              
              {renderFeedback()}
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevExercise}
                  disabled={exercises.indexOf(currentExercise) === 0 || isRecording || isAnalyzing}
                  className={`px-4 py-2 rounded-md ${
                    exercises.indexOf(currentExercise) === 0 || isRecording || isAnalyzing
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={resetExercise}
                  disabled={isRecording || isAnalyzing || (!audioURL && !feedback && !error)}
                  className={`px-4 py-2 rounded-md ${
                    isRecording || isAnalyzing || (!audioURL && !feedback && !error)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  Try Again
                </button>
                <button
                  onClick={nextExercise}
                  disabled={exercises.indexOf(currentExercise) === exercises.length - 1 || isRecording || isAnalyzing}
                  className={`px-4 py-2 rounded-md ${
                    exercises.indexOf(currentExercise) === exercises.length - 1 || isRecording || isAnalyzing
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          
          {!currentExercise && !loading && (
            <div className="text-center py-4 bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg mb-4">No exercises available. Try changing the difficulty or category.</p>
              <button
                onClick={() => {
                  setDifficulty('medium');
                  setCategory('general');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechTherapy;
