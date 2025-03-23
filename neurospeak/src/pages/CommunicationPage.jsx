import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import useSpeech from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';

// Sample data for main categories
const mainCategories = [
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    description: 'Express yourself with speech assistance',
    color: 'from-blue-400 to-blue-600',
    route: null, // No direct route - expands to subcategories
    buttons: [
      { label: 'Quick Phrases', icon: '⚡', action: 'quickPhrases' },
      { label: 'Recent Messages', icon: '🕒', action: 'recentMessages' },
      { label: 'Favorites', icon: '⭐', action: 'favorites' }
    ]
  }
];

// Sample data for communication categories
const communicationData = {
  basics: {
    name: 'Basics',
    icon: '👋',
    description: 'Essential communication for everyday needs',
    color: 'from-blue-400 to-blue-600',
    route: '/basics',
    buttons: [
      { label: 'Greetings', icon: '👋', action: 'greetings' },
      { label: 'Feelings', icon: '😊', action: 'feelings' },
      { label: 'Help', icon: '🆘', action: 'help' }
    ]
  },
  needs: {
    name: 'Needs',
    icon: '🛌',
    description: 'Express personal needs and comfort',
    color: 'from-red-400 to-red-600',
    route: '/needs',
    buttons: [
      { label: 'Food & Drink', icon: '🍽️', action: 'food' },
      { label: 'Personal Care', icon: '🚿', action: 'personalCare' },
      { label: 'Comfort', icon: '🛋️', action: 'comfort' }
    ]
  },
  activities: {
    name: 'Activities',
    icon: '🏃‍♂️',
    description: 'Communicate about daily activities',
    color: 'from-green-400 to-green-600',
    route: '/activities',
    buttons: [
      { label: 'Entertainment', icon: '🎮', action: 'entertainment' },
      { label: 'Movement', icon: '🚶', action: 'movement' },
      { label: 'Daily Tasks', icon: '📝', action: 'dailyTasks' }
    ]
  },
  people: {
    name: 'People',
    icon: '👨‍👩‍👧‍👦',
    description: 'Reference people in your life',
    color: 'from-purple-400 to-purple-600',
    route: '/people',
    buttons: [
      { label: 'Family', icon: '👪', action: 'family' },
      { label: 'Care Team', icon: '👨‍⚕️', action: 'careTeam' },
      { label: 'Social', icon: '👥', action: 'social' }
    ]
  }
};

// Category Card Component
const CategoryCard = ({ category, data, onClick, handleButtonAction }) => {
  return (
    <motion.div
      className="category-card bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300"
      style={{ 
        boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(category)}
    >
      <div className="p-4 flex justify-center items-center" style={{ 
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))'
      }}>
        <span className="text-5xl">{data.icon}</span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--primary-dark)' }}>{data.name}</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--textSecondary)' }}>{data.description}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          {data.buttons && data.buttons.map((button, index) => (
            <motion.button
              key={index}
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--primary-dark)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonAction(button.action);
              }}
            >
              <span className="mr-1">{button.icon}</span>
              {button.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main Category Card Component
const MainCategoryCard = ({ data, onClick, handleButtonAction }) => {
  return (
    <motion.div
      className="category-card bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300"
      style={{ 
        boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(data)}
    >
      <div className="p-5 flex justify-center items-center" style={{ 
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))'
      }}>
        <span className="text-6xl">{data.icon}</span>
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-semibold mb-2" style={{ 
          fontFamily: 'var(--font-display)',
          color: 'var(--primary-dark)' 
        }}>{data.name}</h3>
        <p className="mb-4" style={{ color: 'var(--textSecondary)' }}>{data.description}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {data.buttons && data.buttons.map((button, index) => (
            <motion.button
              key={index}
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: 'var(--secondary-light)',
                color: 'var(--primary-dark)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonAction(button.action);
              }}
            >
              <span className="mr-1">{button.icon}</span>
              {button.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
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

const CommunicationPage = () => {
  const [sentence, setSentence] = useState([]);
  const { speak, speechSynthesisAvailable } = useSpeech();
  const { audioFeedback } = useAccessibility();
  const navigate = useNavigate();
  
  const handleCategorySelect = (category) => {
    navigate(communicationData[category].route);
  };
  
  const handleButtonAction = (action) => {
    // Handle different button actions
    console.log(`Action triggered: ${action}`);
    
    // Example implementation
    switch(action) {
      case 'quickPhrases':
        // Show quick phrases section
        break;
      case 'recentMessages':
        // Show recent messages
        break;
      case 'favorites':
        // Show favorites
        break;
      default:
        // For subcategory actions, navigate to the appropriate section
        if (action === 'greetings' || action === 'feelings' || action === 'help') {
          navigate(`/basics?section=${action}`);
        } else if (action === 'food' || action === 'personalCare' || action === 'comfort') {
          navigate(`/needs?section=${action}`);
        } else if (action === 'entertainment' || action === 'movement' || action === 'dailyTasks') {
          navigate(`/activities?section=${action}`);
        } else if (action === 'family' || action === 'careTeam' || action === 'social') {
          navigate(`/people?section=${action}`);
        }
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
  
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--secondary)' }}>
      <Header />
      
      <main className="flex-1 px-4 py-6 pb-28 max-w-screen-lg mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ 
            fontFamily: 'var(--font-display)',
            color: 'var(--primary-dark)'
          }}>Communication</h1>
          <p className="text-sm md:text-base mb-6" style={{ color: 'var(--textSecondary)' }}>
            Express yourself with speech assistance and quick phrases
          </p>
        </div>
        
        {/* Main Communication Card */}
        {mainCategories.map(category => (
          <MainCategoryCard 
            key={category.id}
            data={category}
            onClick={() => console.log('Main category clicked')}
            handleButtonAction={handleButtonAction}
          />
        ))}
        
        {/* Categories Grid */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-dark)' }}>Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(communicationData).map(category => (
              <CategoryCard 
                key={category}
                category={category}
                data={communicationData[category]}
                onClick={handleCategorySelect}
                handleButtonAction={handleButtonAction}
              />
            ))}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 border-t z-10 pb-safe" style={{
        backgroundColor: 'var(--secondary-light)',
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
        className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ${
          isActive ? 'bg-blue-50' : ''
        }`}
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

export default CommunicationPage;
