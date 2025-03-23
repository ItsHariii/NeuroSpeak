import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import useSpeech from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';

// Sample data for communication categories and subcategories
const activitiesData = {
  name: 'Activities',
  icon: '🏃‍♂️',
  subcategories: {
    leisure: {
      name: 'Leisure',
      items: [
        { id: 'leis-1', icon: '📺', label: 'TV' },
        { id: 'leis-2', icon: '🎵', label: 'Music' },
        { id: 'leis-3', icon: '📱', label: 'Phone' },
        { id: 'leis-4', icon: '📚', label: 'Book' },
        { id: 'leis-5', icon: '🎮', label: 'Game' },
        { id: 'leis-6', icon: '🎨', label: 'Art' },
        { id: 'leis-7', icon: '🎬', label: 'Movie' },
        { id: 'leis-8', icon: '🧩', label: 'Puzzle' },
        { id: 'leis-9', icon: '🎭', label: 'Show' },
        { id: 'leis-10', icon: '🎧', label: 'Podcast' },
        { id: 'leis-11', icon: '🎲', label: 'Board game' },
        { id: 'leis-12', icon: '📷', label: 'Photos' },
        { id: 'leis-13', icon: '🎹', label: 'Instrument' },
        { id: 'leis-14', icon: '🎯', label: 'Hobby' },
        { id: 'leis-15', icon: '🌳', label: 'Garden' },
        { id: 'leis-16', icon: '🎪', label: 'Entertainment' },
      ]
    },
    movement: {
      name: 'Movement',
      items: [
        { id: 'move-1', icon: '🚶', label: 'Walk' },
        { id: 'move-2', icon: '🏃‍♂️', label: 'Exercise' },
        { id: 'move-3', icon: '🧘', label: 'Stretch' },
        { id: 'move-4', icon: '🚗', label: 'Drive' },
        { id: 'move-5', icon: '🚪', label: 'Outside' },
        { id: 'move-6', icon: '🏠', label: 'Home' },
        { id: 'move-7', icon: '🚶‍♀️', label: 'Slow down' },
        { id: 'move-8', icon: '🏃‍♀️', label: 'Faster' },
        { id: 'move-9', icon: '🧍', label: 'Stand up' },
        { id: 'move-10', icon: '🪑', label: 'Sit down' },
        { id: 'move-11', icon: '🛌', label: 'Lie down' },
        { id: 'move-12', icon: '🚶‍♂️', label: 'Follow me' },
        { id: 'move-13', icon: '🏋️‍♀️', label: 'Therapy' },
        { id: 'move-14', icon: '🚲', label: 'Bicycle' },
        { id: 'move-15', icon: '🏊‍♂️', label: 'Swim' },
        { id: 'move-16', icon: '⛹️‍♀️', label: 'Play sports' },
      ]
    },
    daily: {
      name: 'Daily Tasks',
      items: [
        { id: 'task-1', icon: '🧹', label: 'Clean' },
        { id: 'task-2', icon: '🧺', label: 'Laundry' },
        { id: 'task-3', icon: '🛒', label: 'Shopping' },
        { id: 'task-4', icon: '📝', label: 'Work' },
        { id: 'task-5', icon: '💻', label: 'Computer' },
        { id: 'task-6', icon: '📞', label: 'Call' },
        { id: 'task-7', icon: '📆', label: 'Appointment' },
        { id: 'task-8', icon: '💰', label: 'Pay bills' },
        { id: 'task-9', icon: '🍳', label: 'Cook' },
        { id: 'task-10', icon: '🧽', label: 'Dishes' },
        { id: 'task-11', icon: '📧', label: 'Email' },
        { id: 'task-12', icon: '📦', label: 'Package' },
        { id: 'task-13', icon: '✉️', label: 'Mail' },
        { id: 'task-14', icon: '🛠️', label: 'Fix' },
        { id: 'task-15', icon: '🧾', label: 'Paperwork' },
        { id: 'task-16', icon: '⏰', label: 'Schedule' },
      ]
    }
  }
};

// Communication Tile Component
const CommunicationTile = ({ item, onSelect }) => {
  const { textSize } = useAccessibility();
  
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };
  
  return (
    <motion.div
      className="communication-tile rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: 'var(--secondary-light)',
        boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        backgroundColor: "var(--secondary-light)"
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(item)}
    >
      <motion.span 
        className="text-3xl mb-2"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {item.icon}
      </motion.span>
      <span className={`text-center font-medium ${getTextSizeClass()}`} style={{ color: 'var(--primary-dark)' }}>
        {item.label}
      </span>
    </motion.div>
  );
};

// Subcategory Pill Component
const SubcategoryPill = ({ name, active, onClick }) => {
  return (
    <motion.button
      className={`pill flex items-center justify-center rounded-xl px-4 py-3 font-medium transition-all duration-300 ${
        active 
          ? 'text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
      style={active ? {
        background: 'linear-gradient(to right, var(--primary), var(--accent))'
      } : {}}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {name}
    </motion.button>
  );
};

// Quick Suggestion Component
const QuickSuggestion = ({ text, onSelect }) => {
  return (
    <motion.button
      className="pill rounded-xl px-4 py-3 whitespace-nowrap transition-all duration-300"
      style={{
        backgroundColor: 'var(--secondary-light)',
        color: 'var(--primary-dark)',
        boxShadow: '3px 3px 6px rgba(166, 180, 200, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.7)'
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -2,
        boxShadow: '4px 4px 8px rgba(166, 180, 200, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.8)'
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(text)}
    >
      {text}
    </motion.button>
  );
};

const ActivitiesPage = () => {
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [sentence, setSentence] = useState([]);
  const { speak, speechSynthesisAvailable } = useSpeech();
  const { audioFeedback } = useAccessibility();
  const navigate = useNavigate();
  
  // Set the first subcategory as default when component mounts
  useEffect(() => {
    const firstSubcategory = Object.keys(activitiesData.subcategories)[0];
    setSelectedSubcategory(firstSubcategory);
  }, []);
  
  const handleTileSelect = (item) => {
    setSentence([...sentence, item.label]);
    
    // Provide audio feedback if enabled
    if (audioFeedback) {
      speak(item.label);
    }
  };
  
  const handleClear = () => {
    setSentence([]);
  };
  
  const handleSpeak = () => {
    if (sentence.length > 0) {
      speak(sentence.join(' '));
    }
  };
  
  const handleQuickSuggestion = (text) => {
    setSentence(text.split(' '));
    
    // Provide audio feedback if enabled
    if (audioFeedback) {
      speak(text);
    }
  };
  
  const handleBack = () => {
    navigate('/communicate');
  };
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--secondary)' }}>
      <Header />
      
      {/* Sentence Builder */}
      <div className="sticky top-[40px] z-10 backdrop-blur-sm py-3 border-b" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(166, 180, 200, 0.1)'
      }}>
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="min-h-12 p-4 rounded-xl mb-3 flex flex-wrap gap-2" style={{
            backgroundColor: 'var(--secondary-light)',
            boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
          }}>
            {sentence.length > 0 ? (
              sentence.map((word, index) => (
                <motion.span 
                  key={index} 
                  className="pill px-3 py-1 rounded-full font-medium"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), var(--primary-light))',
                    color: 'white',
                    boxShadow: '2px 2px 4px rgba(166, 180, 200, 0.2)'
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {word}
                </motion.span>
              ))
            ) : (
              <span style={{ color: 'var(--textSecondary)' }} className="italic">Tap tiles to build a sentence...</span>
            )}
          </div>
          
          <div className="flex justify-between gap-3">
            <motion.button 
              className={`btn flex-1 py-2 px-6 rounded-xl font-medium flex items-center justify-center ${
                sentence.length === 0 || !speechSynthesisAvailable
                  ? 'cursor-not-allowed'
                  : 'hover:shadow-lg'
              }`}
              style={{
                backgroundColor: sentence.length === 0 || !speechSynthesisAvailable 
                  ? 'var(--secondary-light)' 
                  : 'var(--primary)',
                color: sentence.length === 0 || !speechSynthesisAvailable 
                  ? 'var(--textSecondary)' 
                  : 'white',
                boxShadow: sentence.length === 0 || !speechSynthesisAvailable 
                  ? 'inset 1px 1px 2px rgba(166, 180, 200, 0.2)' 
                  : '3px 3px 6px rgba(166, 180, 200, 0.2), -3px -3px 6px rgba(255, 255, 255, 0.7)'
              }}
              whileHover={sentence.length > 0 ? { scale: 1.02 } : {}}
              whileTap={sentence.length > 0 ? { scale: 0.98 } : {}}
              onClick={handleSpeak}
              disabled={sentence.length === 0 || !speechSynthesisAvailable}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="w-5 h-5 mr-2"
              >
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
              Speak
            </motion.button>
            
            {sentence.length > 0 && (
              <motion.button 
                className="btn py-2 px-6 rounded-xl font-medium"
                style={{
                  backgroundColor: 'var(--secondary-light)',
                  color: 'var(--primary-dark)',
                  boxShadow: '3px 3px 6px rgba(166, 180, 200, 0.1), -3px -3px 6px rgba(255, 255, 255, 0.7)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClear}
              >
                Clear
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      <main className="flex-1 px-4 py-4 max-w-screen-lg mx-auto w-full pb-28">
        {/* Back button */}
        <div className="mb-4">
          <motion.button
            className="flex items-center font-medium"
            style={{ color: 'var(--primary)' }}
            onClick={handleBack}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
            Back to Categories
          </motion.button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="mb-6 overflow-x-auto pb-2">
          <h2 className="text-lg font-semibold mb-3 flex items-center" style={{ color: 'var(--primary-dark)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }}>
              <path d="M9 4.5a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
            Quick Phrases
          </h2>
          <div className="flex gap-3 flex-wrap">
            <QuickSuggestion text="I want to walk" onSelect={handleQuickSuggestion} />
            <QuickSuggestion text="I want to watch TV" onSelect={handleQuickSuggestion} />
            <QuickSuggestion text="I want to listen to music" onSelect={handleQuickSuggestion} />
            <QuickSuggestion text="I need to make a call" onSelect={handleQuickSuggestion} />
            <QuickSuggestion text="I want to go outside" onSelect={handleQuickSuggestion} />
            <QuickSuggestion text="I want to play a game" onSelect={handleQuickSuggestion} />
          </div>
        </div>
        
        {/* Category Header */}
        <div className="flex items-center mb-4">
          <div className="text-3xl mr-3">{activitiesData.icon}</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-dark)' }}>{activitiesData.name}</h1>
        </div>
        
        {/* Subcategories */}
        <div className="overflow-x-auto mb-4 p-3 rounded-xl" style={{
          backgroundColor: 'var(--secondary-light)',
          boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
        }}>
          <div className="flex gap-3 pb-1 snap-x snap-mandatory">
            {Object.entries(activitiesData.subcategories).map(([key, subcategory]) => (
              <div key={key} className="snap-start">
                <SubcategoryPill 
                  name={subcategory.name}
                  active={selectedSubcategory === key}
                  onClick={() => setSelectedSubcategory(key)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Communication Tiles */}
        {selectedSubcategory && (
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedSubcategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl"
              style={{
                backgroundColor: 'var(--secondary-light)',
                boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
              }}
            >
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activitiesData.subcategories[selectedSubcategory].items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <CommunicationTile 
                      item={item} 
                      onSelect={handleTileSelect} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 border-t z-10 pb-safe" style={{
        backgroundColor: 'white',
        borderColor: 'rgba(166, 180, 200, 0.1)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="absolute bottom-0 left-0 right-0 flex pb-4 pt-2">
          <NavItem icon="🏠" label="Home" isActive={false} to="/" />
          <NavItem icon="💬" label="Talk" isActive={true} to="/communicate" />
          <NavItem icon="🧠" label="Practice" isActive={false} to="/therapy?mode=exercises" />
          <NavItem icon="📊" label="Progress" isActive={false} to="/progress" />
          <NavItem icon="👤" label="Profile" isActive={false} to="/profile" />
        </div>
      </nav>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon, label, isActive, to }) => {
  return (
    <Link 
      to={to} 
      className="flex flex-col items-center justify-center flex-1"
    >
      <div 
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full`}
        style={{
          backgroundColor: isActive ? 'var(--secondary)' : '',
          color: isActive ? 'var(--primary)' : 'var(--textSecondary)'
        }}
      >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default ActivitiesPage;
