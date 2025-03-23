import { useState, useEffect } from 'react';
import apiService from '../services/api';

const ApiExample = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [text, setText] = useState('Hello, welcome to NeuroSpeak!');
  
  // Example user ID - in a real app, this would come from authentication
  const exampleUserId = 'example-user-id';
  
  // Fetch recommendations when component mounts
  useEffect(() => {
    fetchRecommendations();
  }, []);
  
  // Function to fetch emoji recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.recommendations.getRecommendations(exampleUserId);
      
      if (data.error) {
        setError(data.message);
      } else {
        setRecommendations(data);
      }
    } catch (err) {
      setError('Failed to fetch recommendations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle emoji click
  const handleEmojiClick = async (emojiId) => {
    try {
      const result = await apiService.emoji.recordInteraction(exampleUserId, emojiId);
      
      if (result.error) {
        setError(result.message);
      } else {
        console.log('Interaction recorded successfully:', result);
        // Refresh recommendations after recording interaction
        fetchRecommendations();
      }
    } catch (err) {
      setError('Failed to record interaction: ' + err.message);
    }
  };
  
  // Function to convert text to speech
  const handleTextToSpeech = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const audioUrl = await apiService.tts.textToSpeech(text);
      
      if (typeof audioUrl === 'object' && audioUrl.error) {
        setError(audioUrl.message);
      } else {
        setAudioUrl(audioUrl);
        
        // Play the audio
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (err) {
      setError('Text-to-speech failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>
      
      {/* Text-to-Speech Section */}
      <div className="mb-8 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Text-to-Speech</h2>
        <div className="flex flex-col space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
          <button
            onClick={handleTextToSpeech}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Speak Text'}
          </button>
          
          {audioUrl && (
            <div className="mt-4">
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}
        </div>
      </div>
      
      {/* Emoji Recommendations Section */}
      <div className="mb-8 p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Emoji Recommendations</h2>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 mb-4"
        >
          {loading ? 'Loading...' : 'Refresh Recommendations'}
        </button>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
          {recommendations.length > 0 ? (
            recommendations.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji.id)}
                className="text-4xl p-2 bg-white rounded-lg hover:bg-gray-200 transition-colors"
              >
                {emoji.symbol}
              </button>
            ))
          ) : (
            <div className="col-span-full text-center py-4">
              {loading ? 'Loading recommendations...' : 'No recommendations available'}
            </div>
          )}
        </div>
      </div>
      
      {/* API Documentation */}
      <div className="p-6 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium">Authentication</h3>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-2">
              POST /api/auth/token
            </code>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Emoji Interaction</h3>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-2">
              POST /api/emoji/interaction
            </code>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Recommendations</h3>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-2">
              GET /api/recommendations?user_id={'{user_id}'}
            </code>
          </div>
          
          <div>
            <h3 className="text-xl font-medium">Text-to-Speech</h3>
            <code className="block bg-gray-800 text-green-400 p-2 rounded mt-2">
              POST /api/tts
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExample;
