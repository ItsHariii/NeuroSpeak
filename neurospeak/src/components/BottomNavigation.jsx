import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNavigation = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-gray-100 shadow-sm z-10"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full">
        <NavItem icon="🏠" label="Home" isActive={isActive('/')} to="/" />
        <NavItem icon="💬" label="Talk" isActive={isActive('/communicate')} to="/communicate" />
        <NavItem icon="🧠" label="Practice" isActive={isActive('/therapy')} to="/therapy" />
        <NavItem icon="📊" label="Progress" isActive={isActive('/progress')} to="/progress" />
        <NavItem icon="⚙️" label="Settings" isActive={isActive('/settings')} to="/settings" />
      </div>
    </motion.nav>
  );
};

const NavItem = ({ icon, label, isActive, to }) => {
  return (
    <Link to={to} className="flex flex-col items-center justify-center flex-1">
      <div className={`text-xl ${isActive ? 'text-primary' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 ${isActive ? 'font-medium text-primary' : 'text-gray-500'}`}>
        {label}
      </span>
    </Link>
  );
};

export default BottomNavigation;
