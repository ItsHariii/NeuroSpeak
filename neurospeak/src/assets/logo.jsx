import React from 'react';
import { motion } from 'framer-motion';
import neuroSpeakLogo from './neurospeak.png';

const Logo = () => {
  return (
    <div className="flex items-center">
      <div className="relative mr-2">
        <motion.div
          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          animate={{ 
            boxShadow: ['0 4px 14px 0 rgba(58, 111, 248, 0.2)', '0 4px 14px 0 rgba(58, 111, 248, 0.3)', '0 4px 14px 0 rgba(58, 111, 248, 0.2)']
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <motion.img 
            src={neuroSpeakLogo}
            alt="NeuroSpeak Logo"
            className="w-9 h-9 object-contain"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      </div>
      
      <div className="flex flex-col">
        <motion.span 
          className="text-xl font-bold leading-tight"
          style={{ 
            color: 'var(--accent)',
            fontFamily: "var(--font-display)",
            letterSpacing: '0.5px'
          }}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          NeuroSpeak
        </motion.span>
        <motion.span 
          className="text-xs leading-tight"
          style={{ color: 'var(--accent)', fontFamily: "var(--font-display)", fontWeight: 600 }}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Communication Assistant
        </motion.span>
      </div>
    </div>
  );
};

export default Logo;
