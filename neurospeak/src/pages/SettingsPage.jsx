import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useAccessibility } from '../context/AccessibilityContext';

const TabButton = ({ label, active, onClick }) => {
  return (
    <button
      className={`px-4 py-2 rounded-xl text-lg font-medium transition-all ${
        active 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-textSecondary hover:bg-gray-200'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

const ToggleSwitch = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-lg">{label}</span>
      <button 
        className={`w-14 h-8 rounded-full p-1 transition-all ${
          value ? 'bg-primary' : 'bg-gray-300'
        }`}
        onClick={() => onChange(!value)}
      >
        <motion.div 
          className="w-6 h-6 bg-white rounded-full shadow-md"
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

const RadioOption = ({ label, selected, onChange }) => {
  return (
    <div 
      className={`p-4 border-2 rounded-xl mb-2 cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/10' : 'border-gray-200'
      }`}
      onClick={onChange}
    >
      <div className="flex items-center">
        <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
          selected ? 'border-primary' : 'border-gray-300'
        }`}>
          {selected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
        <span className="text-lg">{label}</span>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('accessibility');
  
  // Use accessibility context
  const { 
    highContrast, 
    setHighContrast, 
    textSize, 
    setTextSize, 
    audioFeedback, 
    setAudioFeedback 
  } = useAccessibility();
  
  // Profile info
  const userProfile = {
    name: 'Maria Johnson',
    email: 'maria.j@example.com',
    photo: null
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'accessibility':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Accessibility Settings</h2>
            
            <div className="card mb-4">
              <h3 className="text-lg font-medium mb-3">Display Options</h3>
              <ToggleSwitch 
                label="High Contrast Mode" 
                value={highContrast} 
                onChange={setHighContrast} 
              />
              <hr className="my-2 border-gray-200" />
              <ToggleSwitch 
                label="Audio Feedback" 
                value={audioFeedback} 
                onChange={setAudioFeedback} 
              />
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Text Size</h3>
              <div className="space-y-2">
                <RadioOption 
                  label="Small" 
                  selected={textSize === 'small'} 
                  onChange={() => setTextSize('small')} 
                />
                <RadioOption 
                  label="Medium" 
                  selected={textSize === 'medium'} 
                  onChange={() => setTextSize('medium')} 
                />
                <RadioOption 
                  label="Large" 
                  selected={textSize === 'large'} 
                  onChange={() => setTextSize('large')} 
                />
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium mb-2">Text Size Preview</h4>
                <p className={`${
                  textSize === 'small' ? 'text-base' : 
                  textSize === 'medium' ? 'text-lg' : 'text-2xl'
                }`}>
                  This is how your text will appear.
                </p>
              </div>
            </div>
          </div>
        );
        
      case 'profile':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
            
            <div className="card">
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-white text-3xl mb-3">
                  {userProfile.photo ? (
                    <img 
                      src={userProfile.photo} 
                      alt={userProfile.name} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    userProfile.name.charAt(0)
                  )}
                </div>
                <button className="btn-gray">Change Photo</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-textSecondary mb-1">Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name} 
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-textSecondary mb-1">Email</label>
                  <input 
                    type="email" 
                    value={userProfile.email} 
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'theme':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Theme Settings</h2>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Color Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-primary rounded-xl p-3 flex flex-col items-center">
                  <div className="w-full h-24 bg-primary rounded-lg mb-2"></div>
                  <span className="font-medium">Sky Blue</span>
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center">
                  <div className="w-full h-24 bg-purple-400 rounded-lg mb-2"></div>
                  <span className="font-medium">Purple</span>
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center">
                  <div className="w-full h-24 bg-green-400 rounded-lg mb-2"></div>
                  <span className="font-medium">Green</span>
                </div>
                
                <div className="border-2 border-gray-200 rounded-xl p-3 flex flex-col items-center">
                  <div className="w-full h-24 bg-orange-400 rounded-lg mb-2"></div>
                  <span className="font-medium">Orange</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'caregiver':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Caregiver Portal</h2>
            
            <div className="card mb-4">
              <h3 className="text-lg font-medium mb-3">Caregiver Access</h3>
              <p className="text-textSecondary mb-4">
                Allow a caregiver to monitor your progress and customize your therapy exercises.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-textSecondary mb-1">Caregiver Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter caregiver's email" 
                    className="w-full p-3 border border-gray-300 rounded-xl text-lg"
                  />
                </div>
                
                <button className="btn btn-primary w-full">
                  Send Invitation
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Current Caregivers</h3>
              <p className="text-textSecondary italic">No caregivers added yet</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showProfile={false} />
      
      <main className="flex-1 px-4 py-6 max-w-screen-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <TabButton 
            label="🧏 Accessibility" 
            active={activeTab === 'accessibility'} 
            onClick={() => setActiveTab('accessibility')} 
          />
          <TabButton 
            label="👤 Profile" 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
          />
          <TabButton 
            label="🎨 Theme" 
            active={activeTab === 'theme'} 
            onClick={() => setActiveTab('theme')} 
          />
          <TabButton 
            label="👩‍⚕️ Caregiver" 
            active={activeTab === 'caregiver'} 
            onClick={() => setActiveTab('caregiver')} 
          />
        </div>
        
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
