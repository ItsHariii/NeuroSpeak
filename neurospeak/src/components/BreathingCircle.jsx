import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BreathingCircle = ({ phase, duration, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval;
    let timeoutId;
    
    if (isActive && duration > 0) {
      const step = 100 / (duration * 10); // Update every 100ms
      
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + step;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100);
      
      timeoutId = setTimeout(() => {
        setProgress(100);
        clearInterval(interval);
        if (onComplete) {
          onComplete();
          if (phase === 'exhale') {
            setCycleCount(prev => prev + 1);
          }
        }
      }, duration * 1000);
    }
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [isActive, duration, onComplete, phase]);

  useEffect(() => {
    // Reset progress when phase changes
    setProgress(0);
    setIsActive(true);
  }, [phase]);

  // Reset the breathing cycle
  const resetCycle = () => {
    if (phase === 'rest') {
      setProgress(0);
      onComplete();
    }
  };

  // Define circle properties based on breathing phase
  const getCircleProperties = () => {
    switch (phase) {
      case 'inhale':
        return {
          scale: [1, 1.5],
          backgroundColor: '#4ade80', // Green
          borderColor: '#22c55e',
          text: 'Breathe In',
          textColor: 'text-green-600'
        };
      case 'hold':
        return {
          scale: 1.5,
          backgroundColor: '#60a5fa', // Blue
          borderColor: '#3b82f6',
          text: 'Hold',
          textColor: 'text-blue-600'
        };
      case 'exhale':
        return {
          scale: [1.5, 1],
          backgroundColor: '#f97316', // Orange
          borderColor: '#ea580c',
          text: 'Breathe Out',
          textColor: 'text-orange-600'
        };
      case 'rest':
        return {
          scale: 1,
          backgroundColor: '#a855f7', // Purple
          borderColor: '#9333ea',
          text: 'Tap to Restart',
          textColor: 'text-purple-600'
        };
      default:
        return {
          scale: 1,
          backgroundColor: '#d1d5db', // Gray
          borderColor: '#9ca3af',
          text: 'Ready',
          textColor: 'text-gray-600'
        };
    }
  };

  const circleProps = getCircleProperties();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        {/* Progress ring */}
        <svg className="w-64 h-64" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={circleProps.borderColor}
            strokeWidth="5"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        
        {/* Animated breathing circle */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: typeof circleProps.scale === 'object' ? circleProps.scale : [circleProps.scale, circleProps.scale]
          }}
          transition={{
            duration: duration,
            ease: phase === 'hold' ? 'easeOut' : 'easeInOut',
            repeat: 0
          }}
          onClick={phase === 'rest' ? resetCycle : undefined}
        >
          <motion.div
            className="w-40 h-40 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
            animate={{
              backgroundColor: circleProps.backgroundColor
            }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-xl font-bold ${circleProps.textColor}`}>
              {circleProps.text}
            </span>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Timer display */}
      <div className="text-2xl font-bold text-gray-700">
        {duration > 0 && phase !== 'rest' ? Math.ceil(duration * (1 - progress / 100)) : ''}
      </div>
      
      {/* Cycle counter */}
      {cycleCount > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Completed cycles: {cycleCount}
        </div>
      )}
      
      {/* Instructions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 text-center max-w-md"
        >
          <p className="text-lg font-medium mb-1">
            {phase === 'inhale' && 'Breathe in through your nose'}
            {phase === 'hold' && 'Hold your breath'}
            {phase === 'exhale' && 'Exhale slowly through your mouth'}
            {phase === 'rest' && 'Tap the circle to start another cycle'}
          </p>
          <p className="text-sm text-gray-500">
            {phase === 'inhale' && 'Fill your lungs completely'}
            {phase === 'hold' && 'Keep your breath held'}
            {phase === 'exhale' && 'Empty your lungs completely'}
            {phase === 'rest' && 'Or use the Next button to continue'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BreathingCircle;
