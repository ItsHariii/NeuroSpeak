import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../assets/logo';

const Header = () => {
  const [hasDynamicIsland, setHasDynamicIsland] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Check if device has a Dynamic Island or notch
    const checkForDynamicIsland = () => {
      // iPhone models with Dynamic Island or notch
      const iPhoneWithNotchUserAgents = [
        // iPhone X, XS, XR, 11, 12, 13, 14, 15 series
        /iPhone1[0-5],/i,
        // Generic detection for newer models
        /iPhone/i
      ];
      
      const userAgent = navigator.userAgent;
      const hasNotch = iPhoneWithNotchUserAgents.some(regex => regex.test(userAgent));
      
      // Additional check for viewport dimensions typical of newer iPhones
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const aspectRatio = viewportHeight / viewportWidth;
      
      // Modern iPhones have aspect ratios > 2
      const hasModernAspectRatio = aspectRatio > 2;
      
      setHasDynamicIsland(hasNotch || hasModernAspectRatio);
    };
    
    checkForDynamicIsland();
    
    // Set a custom CSS property for viewport height
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVhProperty();
    
    window.addEventListener('resize', setVhProperty);
    return () => window.removeEventListener('resize', setVhProperty);
  }, []);

  return (
    <motion.header 
      className={`sticky top-0 z-10 w-full ${hasDynamicIsland ? 'pt-safe has-dynamic-island' : ''}`}
      style={{
        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
        boxShadow: '0 6px 16px rgba(58, 111, 248, 0.15)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Logo />
            </motion.div>
          </Link>
        </div>
        
        <Link to="/profile">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white">
              {currentUser?.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
                </span>
              )}
            </div>
            {currentUser && (
              <motion.span 
                className="ml-2 text-sm font-medium text-white hidden md:block"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {currentUser.name}
              </motion.span>
            )}
          </motion.div>
        </Link>
      </div>
    </motion.header>
  );
};

export default Header;
