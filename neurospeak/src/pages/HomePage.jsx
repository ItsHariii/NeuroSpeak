import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isIOS, setIsIOS] = useState(false);
  const [practiceStreak, setPracticeStreak] = useState(0);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Detect iOS
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    setIsIOS(detectIOS());
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic practice streak calculation
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

  // Add status bar style
  useEffect(() => {
    document.documentElement.style.setProperty('--status-bar-color', 'white');
    
    // Set a custom CSS property for viewport height (iOS fix)
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    
    return () => {
      document.documentElement.style.removeProperty('--status-bar-color');
      window.removeEventListener('resize', setVhProperty);
    };
  }, []);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Get time of day for personalized greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get user's first name
  const getUserFirstName = () => {
    if (!currentUser?.name) return "";
    return currentUser.name.split(' ')[0];
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--secondary-light)]">
      <Header />
      
      <main className="flex-grow px-4 pt-6 pb-28 max-w-screen-xl mx-auto w-full">
        <motion.div
          className="grid grid-cols-1 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.section variants={itemVariants} className="mb-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ 
              fontFamily: 'var(--font-display)',
              color: 'var(--primary-dark)'
            }}>
              {getTimeBasedGreeting()}, {getUserFirstName()}!
            </h1>
            <p className="text-sm md:text-base" style={{ 
              fontFamily: 'var(--font-primary)',
              color: 'var(--textSecondary)'
            }}>
              Let's continue your speech journey today.
            </p>
          </motion.section>

          {/* Stats Cards */}
          <motion.section variants={itemVariants} className="grid grid-cols-2 gap-5 mb-6">
            <div className="stat-card neumorphic p-5">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-medium tracking-wide mb-2" style={{ 
                  color: 'var(--textSecondary)',
                  fontFamily: 'var(--font-display)'
                }}>
                  Practice Streak
                </span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold" style={{ 
                    color: 'var(--primary-dark)',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {practiceStreak}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--textSecondary)' }}>days</span>
                </div>
                <div className="mt-3 text-xs font-medium" style={{ color: 'var(--textSecondary)' }}>
                  {practiceStreak > 0 
                    ? `Keep up the great work! 🔥` 
                    : 'Start your streak today! 🚀'}
                </div>
              </div>
            </div>
            
            <div className="stat-card neumorphic p-5">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-medium tracking-wide mb-2" style={{ 
                  color: 'var(--textSecondary)',
                  fontFamily: 'var(--font-display)'
                }}>
                  Sounds Practiced
                </span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold" style={{ 
                    color: 'var(--primary-dark)',
                    fontFamily: 'var(--font-display)'
                  }}>
                    {currentUser?.preferences?.wordsLearned || 0}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--textSecondary)' }}>sounds</span>
                </div>
                <div className="mt-3 text-xs font-medium" style={{ color: 'var(--textSecondary)' }}>
                  {currentUser?.preferences?.wordsLearnedChange > 0 
                    ? `+${currentUser.preferences.wordsLearnedChange} new this week 🎯` 
                    : 'Start practicing new sounds! 🎯'}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Today's Focus */}
          <motion.section variants={itemVariants} className="focus-card p-6 mb-6" style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            boxShadow: '0 8px 20px rgba(58, 111, 248, 0.15)',
            borderRadius: '20px'
          }}>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Today's Focus ✨
            </h2>
            <p className="text-sm md:text-base text-white/90 mb-4" style={{ fontFamily: 'var(--font-primary)' }}>
              {currentUser?.preferences?.dailyFocus || "Practice communication skills for 10 minutes"}
            </p>
            <Link to="/therapy?mode=daily">
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-primary py-3 px-6 rounded-full text-sm font-semibold neumorphic-button"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Start Practice
              </motion.button>
            </Link>
          </motion.section>

          {/* Navigation Cards */}
          <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <NavCard 
              to="/communicate"
              title="Communicate"
              description="Express yourself with speech assistance"
              icon="💬"
              color="neumorphic"
              textColor="text-[var(--primary)]"
            />
            
            <NavCard 
              to="/therapy?mode=exercises"
              title="Speech Therapy"
              description="Daily exercises to improve your speech"
              icon="🧠"
              color="neumorphic"
              textColor="text-[var(--primary-dark)]"
            />
            
            <NavCard 
              to="/progress"
              title="Track Progress"
              description="View your improvement over time"
              icon="📊"
              color="neumorphic"
              textColor="text-[var(--primary)]"
            />
            
            <NavCard 
              to="/profile"
              title="Profile"
              description="Manage your account settings"
              icon="👤"
              color="neumorphic"
              textColor="text-[var(--primary)]"
            />
          </motion.section>
        </motion.div>
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
          <NavItem icon="🏠" label="Home" isActive={true} to="/" />
          <NavItem icon="💬" label="Talk" isActive={false} to="/communicate" />
          <NavItem icon="🧠" label="Practice" isActive={false} to="/therapy?mode=exercises" />
          <NavItem icon="📊" label="Progress" isActive={false} to="/progress" />
          <NavItem icon="👤" label="Profile" isActive={false} to="/profile" />
        </div>
      </nav>
    </div>
  );
};

const NavCard = ({ to, title, description, icon, color, textColor }) => {
  return (
    <Link to={to} className="block">
      <motion.div 
        className={`nav-card ${color} p-5 flex items-start gap-4`}
        whileHover={{ y: -4 }}
        whileTap={{ y: 0 }}
      >
        <div className={`text-2xl`}>{icon}</div>
        <div>
          <h3 className={`font-semibold text-base ${textColor}`} style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>
          <p className="text-textSecondary text-sm mt-1" style={{ fontFamily: 'var(--font-primary)' }}>
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

const NavItem = ({ icon, label, isActive, to }) => {
  return (
    <Link to={to} className="flex flex-col items-center flex-1">
      <motion.div 
        className={`text-xl ${isActive ? 'text-primary' : 'text-gray-400'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.div>
      <span className={`text-xs mt-1 ${isActive ? 'font-medium text-primary' : 'text-gray-500'}`} style={{ fontFamily: 'var(--font-display)' }}>
        {label}
      </span>
    </Link>
  );
};

export default HomePage;
