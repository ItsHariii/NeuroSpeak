import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

// Simple chart component for demonstration
const LineChart = ({ data, label }) => {
  const max = Math.max(...data);
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--primary-dark)' }}>{label}</h3>
      <div className="flex items-end h-32 gap-1">
        {data.map((value, index) => (
          <motion.div
            key={index}
            className="rounded-t-md w-full"
            style={{ backgroundColor: 'var(--primary)' }}
            initial={{ height: 0 }}
            animate={{ height: `${(value / max) * 100}%` }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          ></motion.div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--textSecondary)' }}>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  );
};

const BarChart = ({ data, label }) => {
  const max = Math.max(...data);
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--primary-dark)' }}>{label}</h3>
      <div className="space-y-2">
        {data.map((value, index) => (
          <div key={index} className="flex items-center">
            <span className="w-12 text-sm" style={{ color: 'var(--textSecondary)' }}>Day {index + 1}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden" style={{ 
              backgroundColor: 'var(--secondary-light)',
              boxShadow: 'inset 1px 1px 3px rgba(166, 180, 200, 0.2)'
            }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--primary)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              ></motion.div>
            </div>
            <span className="ml-2 text-sm font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, highlight }) => {
  return (
    <motion.div
      className="bg-white p-4 rounded-xl shadow-md"
      style={{ 
        boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
      }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-xl mr-2`} style={{ 
          backgroundColor: highlight ? 'var(--secondary)' : 'var(--secondary-light)'
        }}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="text-sm" style={{ color: 'var(--textSecondary)' }}>{title}</span>
      </div>
      <div className="text-xl font-semibold" style={{ color: 'var(--primary-dark)' }}>{value}</div>
    </motion.div>
  );
};

const ProgressPage = () => {
  // Sample data
  const clarityData = [65, 70, 68, 75, 80, 78, 85];
  const phrasesData = [5, 8, 12, 10, 15, 14, 18];
  
  // Dynamic practice streak calculation
  const [practiceStreak, setPracticeStreak] = useState(0);
  
  useEffect(() => {
    // This would normally come from a user's data in a real app
    // For demo purposes, we'll calculate a "streak" based on the current date
    const calculateStreak = () => {
      const today = new Date();
      // Use the day of the month modulo 7 + 1 to get a number between 1-7
      const calculatedStreak = (today.getDate() % 7) + 1;
      setPracticeStreak(calculatedStreak);
    };
    
    calculateStreak();
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-[var(--secondary-light)]">
      <Header />
      
      <main className="flex-1 px-4 py-6 pb-24 max-w-screen-md mx-auto w-full">
        {/* Weekly Summary */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ 
            fontFamily: 'var(--font-display)',
            color: 'var(--primary-dark)'
          }}>Your Progress</h1>
          
          <div className="bg-white p-4 rounded-xl shadow-md mb-4" style={{ 
            boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
          }}>
            <div className="flex justify-between items-center">
              <span className="text-lg" style={{ color: 'var(--primary-dark)' }}>This week:</span>
              <div className="px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--secondary)' }}>
                <span className="font-medium" style={{ color: 'var(--primary-dark)' }}>{practiceStreak}/7 therapy days completed</span>
              </div>
            </div>
            
            {/* Celebration message */}
            <div className="mt-4 p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--secondary)' }}>
              <span className="text-lg" style={{ color: 'var(--primary-dark)' }}>🎉 You're making great progress!</span>
            </div>
          </div>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md" style={{ 
            boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
          }}>
            <LineChart data={clarityData} label="Word Clarity Score (%)" />
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md" style={{ 
            boxShadow: '5px 5px 15px rgba(166, 180, 200, 0.1), -5px -5px 15px rgba(255, 255, 255, 0.7)'
          }}>
            <BarChart data={phrasesData} label="Total Phrases Spoken" />
          </div>
        </div>
        
        {/* Stats */}
        <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--primary-dark)' }}>Your Stats</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon="🔤" 
            title="Most Practiced Sounds" 
            value="P, B, T sounds" 
          />
          
          <StatCard 
            icon="⏱️" 
            title="Total Session Time" 
            value="2h 15m" 
          />
          
          <StatCard 
            icon="📈" 
            title="Improvement" 
            value="+15% clarity" 
            highlight={true}
          />
          
          <StatCard 
            icon="🔥" 
            title="Current Streak" 
            value={`${practiceStreak} days`} 
            highlight={true}
          />
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 z-10 pb-safe shadow-lg" style={{
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
      }}>
        <div className="absolute bottom-0 left-0 right-0 flex pb-4 pt-2">
          <NavItem icon="🏠" label="Home" isActive={false} to="/" />
          <NavItem icon="💬" label="Talk" isActive={false} to="/communicate" />
          <NavItem icon="🧠" label="Practice" isActive={false} to="/therapy?mode=exercises" />
          <NavItem icon="📊" label="Progress" isActive={true} to="/progress" />
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

export default ProgressPage;
