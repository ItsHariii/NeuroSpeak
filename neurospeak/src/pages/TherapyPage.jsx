import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import useSpeech from '../hooks/useSpeech';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';

// Exercise categories
const exerciseCategories = [
  {
    id: 'articulation',
    name: 'Articulation',
    description: 'Practice clear pronunciation of sounds and words',
    icon: '🗣️',
    color: 'from-blue-500 to-blue-400'
  },
  {
    id: 'fluency',
    name: 'Fluency',
    description: 'Improve speech rhythm and reduce stuttering',
    icon: '🎵',
    color: 'from-green-500 to-green-400'
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    description: 'Expand your word knowledge and retrieval',
    icon: '📚',
    color: 'from-purple-500 to-purple-400'
  },
  {
    id: 'comprehension',
    name: 'Comprehension',
    description: 'Enhance understanding and following directions',
    icon: '🧠',
    color: 'from-orange-500 to-orange-400'
  }
];

// Enhanced exercises with categories
const exercises = [
  // Articulation Exercises
  {
    id: 1,
    title: 'Consonant Practice',
    description: 'Practice pronouncing challenging consonant sounds',
    difficulty: 'Easy',
    level: 1,
    category: 'articulation',
    icon: 'P',
    points: 10,
    words: [
      { text: 'Park', target: 'P', hint: 'Start with lips pressed together, then release with a puff of air' },
      { text: 'Table', target: 'T', hint: 'Place tongue tip behind upper teeth, then release with a puff of air' },
      { text: 'Kite', target: 'K', hint: 'Place back of tongue against roof of mouth, then release with a puff of air' },
      { text: 'Sun', target: 'S', hint: 'Place tongue tip near upper teeth and push air through' },
      { text: 'Fish', target: 'F', hint: 'Bring bottom lip to upper teeth and push air through' }
    ],
    instructions: 'Listen and repeat each word, focusing on the highlighted sound'
  },
  {
    id: 2,
    title: 'Vowel Clarity',
    description: 'Improve the clarity of vowel sounds in speech',
    difficulty: 'Easy',
    level: 1,
    category: 'articulation',
    icon: 'A',
    points: 10,
    words: [
      { text: 'Eat', target: 'E', hint: 'Smile wide with your mouth and say "ee"' },
      { text: 'At', target: 'A', hint: 'Open your mouth wide for the "a" sound' },
      { text: 'Ice', target: 'I', hint: 'Start with "ah" and glide to "ee"' },
      { text: 'Open', target: 'O', hint: 'Round your lips for the "oh" sound' },
      { text: 'Use', target: 'U', hint: 'Pucker your lips forward for the "oo" sound' }
    ],
    instructions: 'Focus on making clear, distinct vowel sounds in each word'
  },
  {
    id: 3,
    title: 'Minimal Pairs',
    description: 'Practice distinguishing between similar-sounding words',
    difficulty: 'Medium',
    level: 2,
    category: 'articulation',
    icon: 'M',
    points: 15,
    pairs: [
      { word1: 'Pat', word2: 'Bat', focus: 'P vs B sounds' },
      { word1: 'Tie', word2: 'Die', focus: 'T vs D sounds' },
      { word1: 'Sue', word2: 'Zoo', focus: 'S vs Z sounds' },
      { word1: 'Fan', word2: 'Van', focus: 'F vs V sounds' },
      { word1: 'Ship', word2: 'Chip', focus: 'SH vs CH sounds' }
    ],
    instructions: 'Practice saying each pair of words, focusing on the difference between the sounds'
  },
  {
    id: 4,
    title: 'Tongue Twisters',
    description: 'Challenge your articulation with fun tongue twisters',
    difficulty: 'Hard',
    level: 3,
    category: 'articulation',
    icon: 'T',
    points: 20,
    twisters: [
      { text: 'She sells seashells by the seashore', focus: 'S and SH sounds' },
      { text: 'Peter Piper picked a peck of pickled peppers', focus: 'P sound' },
      { text: 'Red lorry, yellow lorry', focus: 'L and R sounds' },
      { text: 'Unique New York', focus: 'N and Y sounds' },
      { text: 'How much wood would a woodchuck chuck', focus: 'W and CH sounds' }
    ],
    instructions: 'Start slowly and gradually increase your speed while maintaining clarity'
  },
  
  // Fluency Exercises
  {
    id: 5,
    title: 'Rhythmic Speech',
    description: 'Practice speaking with a steady, even rhythm',
    difficulty: 'Easy',
    level: 1,
    category: 'fluency',
    icon: '🎵',
    points: 10,
    phrases: [
      'I am speaking with a steady rhythm',
      'One word at a time with control',
      'Smooth and easy does it',
      'Gently moving from word to word',
      'Speaking slowly and deliberately'
    ],
    instructions: 'Speak each phrase with an even pace, like you are following a metronome'
  },
  {
    id: 6,
    title: 'Controlled Breathing',
    description: 'Improve speech fluency through breathing exercises',
    difficulty: 'Easy',
    level: 1,
    category: 'fluency',
    icon: '💨',
    points: 10,
    steps: [
      { instruction: 'Breathe in slowly through your nose', duration: 4 },
      { instruction: 'Hold your breath', duration: 2 },
      { instruction: 'Exhale slowly through your mouth', duration: 6 },
      { instruction: 'Breathe in while raising your arms', duration: 4 },
      { instruction: 'Exhale while lowering your arms', duration: 6 }
    ],
    instructions: 'Follow each breathing instruction for the specified duration in seconds'
  },
  {
    id: 7,
    title: 'Prolonged Speech',
    description: 'Practice extending sounds to improve fluency',
    difficulty: 'Medium',
    level: 2,
    category: 'fluency',
    icon: '➡️',
    points: 15,
    phrases: [
      'Heeello, how are you?',
      'I\'m feeeeling good today',
      'Pleeeease tell me more',
      'Thaaat sounds interesting',
      'Goood morning to you'
    ],
    instructions: 'Stretch the underlined sounds in each phrase for 2-3 seconds'
  },
  {
    id: 8,
    title: 'Easy Onset',
    description: 'Practice gentle starts to words to reduce stuttering',
    difficulty: 'Medium',
    level: 2,
    category: 'fluency',
    icon: '🌊',
    points: 15,
    words: [
      { text: 'Apple', hint: 'Start with a gentle "ah" sound' },
      { text: 'Orange', hint: 'Begin with a soft "oh" sound' },
      { text: 'Hello', hint: 'Start with a gentle breath on the "h"' },
      { text: 'Welcome', hint: 'Ease into the "w" sound' },
      { text: 'Thank you', hint: 'Gently transition into the "th" sound' }
    ],
    instructions: 'Begin each word with a gentle, relaxed start rather than a hard attack'
  },
  
  // Vocabulary Exercises
  {
    id: 9,
    title: 'Category Naming',
    description: 'Practice naming items within specific categories',
    difficulty: 'Easy',
    level: 1,
    category: 'vocabulary',
    icon: '📋',
    points: 10,
    categories: [
      { name: 'Animals', examples: ['Dog', 'Cat', 'Elephant', 'Lion', 'Fish'] },
      { name: 'Fruits', examples: ['Apple', 'Banana', 'Orange', 'Grape', 'Strawberry'] },
      { name: 'Clothing', examples: ['Shirt', 'Pants', 'Dress', 'Socks', 'Hat'] },
      { name: 'Vehicles', examples: ['Car', 'Bus', 'Train', 'Airplane', 'Bicycle'] },
      { name: 'Furniture', examples: ['Chair', 'Table', 'Bed', 'Sofa', 'Desk'] }
    ],
    instructions: 'Name as many items as you can in each category'
  },
  {
    id: 10,
    title: 'Word Associations',
    description: 'Practice making connections between related words',
    difficulty: 'Medium',
    level: 2,
    category: 'vocabulary',
    icon: '🔄',
    points: 15,
    pairs: [
      { word: 'Beach', associations: ['Sand', 'Ocean', 'Waves', 'Sun', 'Towel'] },
      { word: 'Hospital', associations: ['Doctor', 'Nurse', 'Patient', 'Medicine', 'Care'] },
      { word: 'School', associations: ['Teacher', 'Student', 'Book', 'Learn', 'Classroom'] },
      { word: 'Kitchen', associations: ['Cook', 'Food', 'Refrigerator', 'Stove', 'Dishes'] },
      { word: 'Garden', associations: ['Flower', 'Plant', 'Soil', 'Water', 'Grow'] }
    ],
    instructions: 'Say as many words as you can that are related to the given word'
  },
  {
    id: 11,
    title: 'Synonyms & Antonyms',
    description: 'Practice finding words with similar and opposite meanings',
    difficulty: 'Medium',
    level: 2,
    category: 'vocabulary',
    icon: '⚖️',
    points: 15,
    pairs: [
      { word: 'Happy', associations: ['Joyful', 'Glad', 'Cheerful', 'Sad', 'Unhappy'] },
      { word: 'Big', associations: ['Large', 'Huge', 'Enormous', 'Small', 'Tiny'] },
      { word: 'Fast', associations: ['Quick', 'Rapid', 'Swift', 'Slow', 'Sluggish'] },
      { word: 'Hot', associations: ['Warm', 'Burning', 'Scorching', 'Cold', 'Freezing'] },
      { word: 'Beautiful', associations: ['Pretty', 'Gorgeous', 'Attractive', 'Ugly', 'Plain'] }
    ],
    instructions: 'First say three synonyms (similar words), then two antonyms (opposite words) for each given word'
  },
  {
    id: 12,
    title: 'Word Definitions',
    description: 'Practice explaining the meaning of words',
    difficulty: 'Hard',
    level: 3,
    category: 'vocabulary',
    icon: '📖',
    points: 20,
    words: [
      { text: 'Courage', hint: 'The ability to face fear or danger' },
      { text: 'Democracy', hint: 'A system of government by the people' },
      { text: 'Compassion', hint: 'Feeling concern for others who are suffering' },
      { text: 'Innovation', hint: 'Creating new ideas or methods' },
      { text: 'Perseverance', hint: 'Continuing despite difficulties' }
    ],
    instructions: 'Explain the meaning of each word in your own words'
  },
  
  // Comprehension Exercises
  {
    id: 13,
    title: 'Following Directions',
    description: 'Practice understanding and following verbal instructions',
    difficulty: 'Easy',
    level: 1,
    category: 'comprehension',
    icon: '👂',
    points: 10,
    instructions: [
      'Touch your nose, then your left ear',
      'Clap your hands twice, then point to the ceiling',
      'Draw a circle in the air, then a square',
      'Close your eyes, count to three, then open them',
      'Point to something blue, then something red'
    ],
    mainInstructions: 'Listen to each instruction, then perform the actions in the correct order'
  },
  {
    id: 14,
    title: 'Story Comprehension',
    description: 'Practice understanding and recalling details from stories',
    difficulty: 'Medium',
    level: 2,
    category: 'comprehension',
    icon: '📚',
    points: 15,
    stories: [
      {
        text: 'John went to the store to buy milk. On his way, he saw a dog chasing a cat. When he arrived at the store, he realized he had forgotten his wallet at home.',
        questions: [
          { question: 'What did John want to buy?' },
          { question: 'What did he see on his way?' },
          { question: 'Why couldn\'t he buy the milk?' }
        ]
      },
      {
        text: 'Sarah planted a garden in her backyard. She planted tomatoes, carrots, and lettuce. After a month, the tomatoes grew very tall, but the carrots and lettuce were eaten by rabbits.',
        questions: [
          { question: 'Where did Sarah plant her garden?' },
          { question: 'What vegetables did she plant?' },
          { question: 'What happened to the carrots and lettuce?' }
        ]
      },
      {
        text: 'The family went to the beach on Saturday. The children built a sandcastle while their parents swam in the ocean. At lunchtime, they all ate sandwiches and fruit.',
        questions: [
          { question: 'When did the family go to the beach?' },
          { question: 'What did the children do?' },
          { question: 'What did they eat for lunch?' }
        ]
      }
    ],
    mainInstructions: 'Read each story and answer the questions that follow'
  },
  {
    id: 15,
    title: 'Complex Directions',
    description: 'Practice following multi-step instructions',
    difficulty: 'Hard',
    level: 3,
    category: 'comprehension',
    icon: '🧩',
    points: 20,
    instructions: [
      'Touch your right elbow with your left hand, then touch your left knee with your right hand',
      'Draw a triangle in the air, then draw a circle inside it, then put a dot in the center',
      'Clap your hands three times, snap your fingers twice, then pat your shoulders once',
      'Point to something round, then something square, then something with the color blue',
      'Touch your nose, turn around once, then sit down and stand up again'
    ],
    mainInstructions: 'Listen carefully to each set of instructions and perform all steps in the correct order'
  },
  {
    id: 16,
    title: 'Conversation Practice',
    description: 'Practice responding to conversation prompts',
    difficulty: 'Hard',
    level: 3,
    category: 'comprehension',
    icon: '💬',
    points: 20,
    prompts: [
      'Tell me about your favorite hobby and why you enjoy it',
      'Describe your ideal vacation destination',
      'Explain how to make your favorite meal',
      'Talk about a movie or book you enjoyed recently',
      'Describe what you would do if you won a million dollars'
    ],
    instructions: 'Respond to each prompt with at least three complete sentences'
  }
];

const ExerciseCard = ({ exercise, onSelect, completed }) => {
  const { getTextSizeClass } = useAccessibility();
  
  // Get category color
  const getCategoryColor = (categoryId) => {
    const category = exerciseCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'from-gray-500 to-gray-400';
  };
  
  // Get difficulty color
  const getDifficultyStyles = (difficulty) => {
    switch(difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };
  
  return (
    <motion.div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${
        completed ? 'border-l-4 border-green-500' : ''
      }`}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.99 }}
      onClick={() => onSelect(exercise)}
    >
      <div className="relative">
        {/* Category indicator */}
        <div className={`absolute top-0 right-0 h-16 w-16`}>
          <div className={`absolute top-0 right-0 h-16 w-16 bg-gradient-to-br ${getCategoryColor(exercise.category)} opacity-20 transform rotate-45 translate-x-8 -translate-y-8`}></div>
        </div>
        
        <div className="p-5">
          <div className="flex items-start">
            <div className={`flex-shrink-0 rounded-xl p-3 mr-4 text-xl bg-gradient-to-br ${getCategoryColor(exercise.category)} text-white shadow-md`}>
              {exercise.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-semibold text-gray-800 ${getTextSizeClass()}`}>{exercise.title}</h3>
                {completed && (
                  <div className="flex items-center bg-green-100 rounded-full px-2 py-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-green-600 mr-1">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-green-700">Completed</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyStyles(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
                
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  Level {exercise.level}
                </span>
                
                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  {exerciseCategories.find(cat => cat.id === exercise.category)?.name}
                </span>
                
                {completed && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 ml-auto">
                    +{exercise.points} points
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <motion.button 
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                completed 
                  ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-md' 
                  : 'bg-gradient-to-r from-primary to-blue-400 text-white shadow-md'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {completed ? 'Practice Again' : 'Start Exercise'}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ExerciseDetail = ({ exercise, onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const { speak, startListening, stopListening, isListening, speechRecognitionAvailable } = useSpeech();
  const { getTextSizeClass } = useAccessibility();
  
  const getCurrentTarget = () => {
    if (exercise.words && exercise.words[currentStep]) {
      return exercise.words[currentStep].text || exercise.words[currentStep];
    } else if (exercise.twisters && exercise.twisters[currentStep]) {
      return exercise.twisters[currentStep].text;
    } else if (exercise.objects && exercise.objects[currentStep]) {
      return exercise.objects[currentStep];
    } else if (exercise.phrases && exercise.phrases[currentStep]) {
      return exercise.phrases[currentStep];
    } else if (exercise.pairs && exercise.pairs[currentStep]) {
      if (exercise.pairs[currentStep].word1) {
        return `${exercise.pairs[currentStep].word1} and ${exercise.pairs[currentStep].word2}`;
      } else if (exercise.pairs[currentStep].word) {
        return exercise.pairs[currentStep].word;
      }
    } else if (exercise.prompts && exercise.prompts[currentStep]) {
      return exercise.prompts[currentStep];
    } else if (exercise.instructions && exercise.instructions[currentStep]) {
      return exercise.instructions[currentStep];
    } else if (exercise.steps && exercise.steps[currentStep]) {
      return exercise.steps[currentStep].instruction;
    } else if (exercise.stories && exercise.stories[currentStep]) {
      return exercise.stories[currentStep].text;
    } else if (exercise.categories && exercise.categories[currentStep]) {
      return `Category: ${exercise.categories[currentStep].name}`;
    } else if (exercise.sentences && exercise.sentences[currentStep]) {
      return exercise.sentences[currentStep];
    }
    return exercise.text || '';
  };
  
  const getCurrentHint = () => {
    if (exercise.words && exercise.words[currentStep].hint) {
      return exercise.words[currentStep].hint;
    } else if (exercise.twisters && exercise.twisters[currentStep].focus) {
      return `Focus on: ${exercise.twisters[currentStep].focus}`;
    } else if (exercise.pairs && exercise.pairs[currentStep].focus) {
      return `Focus on: ${exercise.pairs[currentStep].focus}`;
    }
    return exercise.instructions || '';
  };
  
  const handleListen = () => {
    speak(getCurrentTarget());
  };
  
  const handleRecord = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
      setAttempts(attempts + 1);
    } else {
      setRecordedText('');
      setFeedback(null);
      startListening({
        onResult: (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setRecordedText(transcript);
          
          // Check if the last result is final
          if (event.results[event.results.length - 1].isFinal) {
            evaluateSpeech(transcript);
          }
        }
      });
      setIsRecording(true);
    }
  };
  
  const evaluateSpeech = (transcript) => {
    const target = getCurrentTarget().toLowerCase();
    const spoken = transcript.toLowerCase();
    
    // Simple string similarity check (can be enhanced with more sophisticated algorithms)
    const similarity = calculateSimilarity(target, spoken);
    
    if (similarity > 0.7) {
      setFeedback({
        type: 'success',
        message: 'Great job! Your pronunciation was excellent.',
        score: 100
      });
      setIsCorrect(true);
    } else if (similarity > 0.5) {
      setFeedback({
        type: 'partial',
        message: 'Good attempt! Try again for better pronunciation.',
        score: 70
      });
      setIsCorrect(false);
    } else {
      setFeedback({
        type: 'error',
        message: 'Try again. Listen to the example and repeat clearly.',
        score: 30
      });
      setIsCorrect(false);
    }
  };
  
  // Simple string similarity algorithm (Levenshtein distance based)
  const calculateSimilarity = (str1, str2) => {
    const track = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
    
    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength > 0 ? 1 - distance / maxLength : 1;
  };
  
  const getStepCount = () => {
    if (exercise.words) return exercise.words.length;
    if (exercise.twisters) return exercise.twisters.length;
    if (exercise.phrases) return exercise.phrases.length;
    if (exercise.pairs) return exercise.pairs.length;
    if (exercise.prompts) return exercise.prompts.length;
    if (exercise.instructions) return exercise.instructions.length;
    if (exercise.steps) return exercise.steps.length;
    if (exercise.stories) return exercise.stories.length;
    if (exercise.categories) return exercise.categories.length;
    if (exercise.objects) return exercise.objects.length;
    return 1;
  };
  
  const handleNext = () => {
    const maxSteps = getStepCount();
    
    if (currentStep < maxSteps - 1) {
      setCurrentStep(currentStep + 1);
      setRecordedText('');
      setFeedback(null);
      setIsCorrect(false);
      setAttempts(0);
      setShowHint(false);
    } else if (isCorrect || attempts >= 3) {
      // Complete the exercise if on the last step and either correct or max attempts reached
      onComplete(exercise);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setRecordedText('');
      setFeedback(null);
      setIsCorrect(false);
      setAttempts(0);
      setShowHint(false);
    }
  };
  
  const renderExerciseContent = () => {
    // Articulation exercises with words
    if (exercise.words) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 shadow-sm border border-blue-100 flex flex-col items-center justify-center"
          >
            <motion.span 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`text-5xl mb-4 ${getTextSizeClass()}`}
            >
              {typeof exercise.words[currentStep] === 'object' ? exercise.words[currentStep].text : exercise.words[currentStep]}
            </motion.span>
            {exercise.words[currentStep].target && (
              <div className="bg-white px-3 py-1 rounded-full text-blue-700 text-sm font-medium mb-2">
                Focus on: {exercise.words[currentStep].target}
              </div>
            )}
          </motion.div>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {exercise.instructions || 'Practice saying this word clearly, focusing on the correct pronunciation'}
          </p>
        </motion.div>
      );
    }
    // Fluency exercises with phrases
    else if (exercise.phrases) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-6 shadow-sm border border-purple-100"
          >
            <motion.h3 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-bold mb-4 text-gray-800 ${getTextSizeClass()}`}
            >
              {exercise.phrases[currentStep]}
            </motion.h3>
          </motion.div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white border border-purple-100 px-4 py-2 rounded-lg text-purple-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
              <span className="font-medium">
                {exercise.instructions || 'Practice saying this phrase with a steady rhythm'}
              </span>
            </div>
          </div>
        </motion.div>
      );
    }
    // Fluency exercises with steps
    else if (exercise.steps) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-6 shadow-sm border border-green-100"
          >
            <motion.h3 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-bold mb-4 text-gray-800 ${getTextSizeClass()}`}
            >
              {exercise.steps[currentStep].instruction}
            </motion.h3>
            <div className="bg-white px-4 py-2 rounded-lg text-teal-700 inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" />
              </svg>
              <span className="font-medium">
                Duration: {exercise.steps[currentStep].duration} seconds
              </span>
            </div>
          </motion.div>
          <p className="text-gray-600 mb-4 text-center">
            {exercise.instructions || 'Follow each breathing instruction for the specified duration'}
          </p>
        </motion.div>
      );
    }
    // Vocabulary exercises with prompts
    else if (exercise.prompts) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-6 shadow-sm border border-green-100">
            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center mb-4"
            >
              <div className="bg-white p-3 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-600">
                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                </svg>
              </div>
            </motion.div>
            <h3 className={`text-xl font-bold mb-2 text-center ${getTextSizeClass()}`}>
              {exercise.prompts[currentStep]}
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-center">
            {exercise.instructions || 'Respond to this prompt with a few sentences'}
          </p>
        </motion.div>
      );
    }
    // Tongue twisters
    else if (exercise.twisters) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 mb-6 shadow-sm border border-yellow-100"
          >
            <motion.h3 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`text-xl font-bold mb-4 ${getTextSizeClass()}`}
            >
              {exercise.twisters[currentStep].text}
            </motion.h3>
            <div className="bg-white text-amber-700 px-4 py-2 rounded-lg inline-block font-medium border border-amber-100">
              Focus on: {exercise.twisters[currentStep].focus}
            </div>
          </motion.div>
          <p className="text-gray-600 mb-4">
            {exercise.instructions || 'Practice saying this tongue twister clearly'}
          </p>
        </motion.div>
      );
    }
    // Category naming exercises
    else if (exercise.categories) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-6 shadow-sm border border-indigo-100"
          >
            <motion.h3 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`text-2xl font-bold mb-4 ${getTextSizeClass()}`}
            >
              {exercise.categories[currentStep].name}
            </motion.h3>
            <div className="bg-white text-indigo-700 px-4 py-2 rounded-lg inline-block font-medium border border-indigo-100">
              Examples: {exercise.categories[currentStep].examples.join(', ')}
            </div>
          </motion.div>
          <p className="text-gray-600 mb-4">
            {exercise.instructions || 'Name as many items as you can in this category'}
          </p>
        </motion.div>
      );
    }
    // Word association exercises
    else if (exercise.pairs && exercise.pairs[0].word) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 mb-6 shadow-sm border border-blue-100"
          >
            <motion.h3 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className={`text-3xl font-bold mb-4 ${getTextSizeClass()}`}
            >
              {exercise.pairs[currentStep].word}
            </motion.h3>
            {exercise.pairs[currentStep].associations && (
              <div className="bg-white text-cyan-700 px-4 py-2 rounded-lg inline-block font-medium border border-cyan-100">
                Possible associations: {exercise.pairs[currentStep].associations.join(', ')}
              </div>
            )}
          </motion.div>
          <p className="text-gray-600 mb-4">
            {exercise.instructions || 'Say as many related words as you can'}
          </p>
        </motion.div>
      );
    }
    // Minimal pairs exercises
    else if (exercise.pairs && exercise.pairs[0].word1) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 shadow-sm border border-blue-100"
          >
            <div className="flex justify-center items-center space-x-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-100"
              >
                <span className={`text-3xl font-bold text-blue-700 ${getTextSizeClass()}`}>
                  {exercise.pairs[currentStep].word1}
                </span>
              </motion.div>
              <span className="text-gray-400 text-2xl">vs</span>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-100"
              >
                <span className={`text-3xl font-bold text-indigo-700 ${getTextSizeClass()}`}>
                  {exercise.pairs[currentStep].word2}
                </span>
              </motion.div>
            </div>
            <div className="mt-4 bg-white text-indigo-700 px-4 py-2 rounded-lg inline-block font-medium border border-indigo-100">
              {exercise.pairs[currentStep].focus}
            </div>
          </motion.div>
          <p className="text-gray-600 mb-4">
            {exercise.instructions || 'Practice saying both words, focusing on the difference between the sounds'}
          </p>
        </motion.div>
      );
    }
    // Story comprehension exercises
    else if (exercise.stories) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 shadow-sm border border-blue-100"
          >
            <p className={`leading-relaxed text-gray-800 mb-6 ${getTextSizeClass()}`}>
              {exercise.stories[currentStep].text}
            </p>
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-gray-800 mb-3">Questions:</h4>
              <ul className="space-y-2">
                {exercise.stories[currentStep].questions.map((q, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700">{q.question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
          <p className="text-gray-600 mb-4 text-center">
            {exercise.mainInstructions || 'Read the story and answer the questions'}
          </p>
        </motion.div>
      );
    }
    // Following directions exercises
    else if (exercise.instructions && Array.isArray(exercise.instructions)) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-6 shadow-sm border border-amber-100"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-600">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
              </div>
            </div>
            <motion.h3 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-xl font-bold mb-2 text-center ${getTextSizeClass()}`}
            >
              {exercise.instructions[currentStep]}
            </motion.h3>
          </motion.div>
          <p className="text-gray-600 mb-4 text-center">
            {exercise.mainInstructions || 'Listen to the instruction and perform the action'}
          </p>
        </motion.div>
      );
    }
    // Object naming (fallback for old format)
    else if (exercise.objects) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-10 mb-6 shadow-sm border border-gray-100 flex items-center justify-center"
          >
            <motion.span 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 15
              }}
              className="text-7xl"
            >
              {
                exercise.objects[currentStep] === 'Clock' ? '🕰️' :
                exercise.objects[currentStep] === 'Chair' ? '🪑' :
                exercise.objects[currentStep] === 'Telephone' ? '☎️' :
                exercise.objects[currentStep] === 'Glasses' ? '👓' :
                '📚'
              }
            </motion.span>
          </motion.div>
          <div className="bg-white border border-blue-100 px-4 py-2 rounded-lg text-blue-700 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
            <span className="font-medium">Name this object out loud</span>
          </div>
        </motion.div>
      );
    }
    // Fluency exercises with sentences
    else if (exercise.sentences) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-6 shadow-sm border border-purple-100"
          >
            <motion.h3 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-bold mb-4 text-gray-800 ${getTextSizeClass()}`}
            >
              {exercise.sentences[currentStep]}
            </motion.h3>
          </motion.div>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white border border-purple-100 px-4 py-2 rounded-lg text-purple-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
              </svg>
              <span className="font-medium">
                {exercise.instructions || 'Practice saying this sentence smoothly and at a comfortable pace'}
              </span>
            </div>
          </div>
        </motion.div>
      );
    }
    // Reading practice (fallback for old format)
    else if (exercise.text) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-6"
        >
          <motion.div 
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 shadow-sm border border-blue-100"
          >
            <p className={`leading-relaxed ${getTextSizeClass()}`}>
              {exercise.text}
            </p>
          </motion.div>
          <div className="bg-white border border-blue-100 px-4 py-2 rounded-lg text-blue-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
              <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
            </svg>
            <span className="font-medium">Read this paragraph aloud and record yourself</span>
          </div>
        </motion.div>
      );
    }
    // Fallback for any other exercise type
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-6 text-center"
      >
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-6 shadow-sm border border-gray-100">
          <p className={`leading-relaxed ${getTextSizeClass()}`}>
            {getCurrentTarget()}
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          {exercise.instructions || 'Complete this exercise as instructed'}
        </p>
      </motion.div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Exercise Header */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-4 border-b border-gray-100">
        <div className="flex items-center">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mr-3 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-700"
            onClick={onBack}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </motion.button>
          
          <div className="flex-1">
            <h2 className={`text-xl font-bold text-gray-800 ${getTextSizeClass()}`}>{exercise.title}</h2>
            <div className="flex items-center mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                {exerciseCategories.find(cat => cat.id === exercise.category)?.name}
              </span>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-xs text-gray-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                  <path fillRule="evenodd" d="M10.788 3.21c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                </svg>
                Level {exercise.level}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Exercise Content */}
      <div className="p-5">
        <div className="mb-6">
          {renderExerciseContent()}
        </div>
        
        {/* Warnings and Feedback */}
        <AnimatePresence>
          {!speechRecognitionAvailable && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-xl mb-4 flex items-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 011.22-.872l3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Speech recognition is not available in your browser.</p>
                <p className="text-sm">Try using Chrome or Edge for the full experience.</p>
              </div>
            </motion.div>
          )}
          
          {recordedText && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl mb-4"
            >
              <p className="font-medium mb-1">You said:</p>
              <p className="italic text-blue-600 bg-white p-3 rounded-lg border border-blue-100">"{recordedText}"</p>
            </motion.div>
          )}
          
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`p-4 rounded-xl mb-4 ${
                feedback.type === 'success' ? 'bg-green-50 border border-green-100 text-green-700' :
                feedback.type === 'partial' ? 'bg-yellow-50 border border-yellow-100 text-yellow-700' :
                'bg-red-50 border border-red-100 text-red-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="mr-2">
                    {feedback.type === 'success' ? '🎉' : feedback.type === 'partial' ? '👍' : '🔄'}
                  </span>
                  <p className="font-medium">{feedback.message}</p>
                </div>
                <span className="font-bold text-lg">{feedback.score}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${feedback.score}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    feedback.type === 'success' ? 'bg-green-500' :
                    feedback.type === 'partial' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} 
                ></motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-3 px-4 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center text-gray-700 font-medium"
            onClick={handleListen}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-primary">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
            Listen
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-3 px-4 rounded-xl shadow-md flex items-center justify-center font-medium ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 to-red-400 text-white' 
                : 'bg-gradient-to-r from-primary to-blue-400 text-white shadow-md'
            }`}
            onClick={handleRecord}
            disabled={!speechRecognitionAvailable}
          >
            {isRecording ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
                </svg>
                Stop Recording
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
                Start Recording
              </>
            )}
          </motion.button>
        </div>
        
        {/* Navigation and Progress */}
        <div className="flex justify-between items-center">
          <motion.button 
            whileHover={{ x: -2 }}
            whileTap={{ x: -4 }}
            className={`flex items-center py-2 px-3 rounded-lg text-sm ${
              currentStep === 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
            Previous
          </motion.button>
          
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600 font-medium mb-2">
              Step {currentStep + 1} of {getStepCount()}
            </span>
            <div className="flex space-x-1.5">
              {Array.from({ length: getStepCount() }, (_, i) => (
                <motion.div 
                  key={i} 
                  initial={false}
                  animate={i === currentStep ? { 
                    width: 20,
                    backgroundColor: '#3b82f6'
                  } : {
                    width: 8,
                    backgroundColor: '#e5e7eb'
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>
          </div>
          
          <div className="flex">
            {getCurrentHint() && (
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`flex items-center py-2 px-3 mr-2 rounded-lg text-sm ${
                  showHint 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-white border border-yellow-200 text-yellow-600'
                }`}
                onClick={() => setShowHint(!showHint)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
                {showHint ? 'Hide Hint' : 'Hint'}
              </motion.button>
            )}
            
            <motion.button 
              whileHover={{ x: 2 }}
              whileTap={{ x: 4 }}
              className={`flex items-center py-2 px-4 rounded-lg text-sm font-medium ${
                isCorrect || attempts >= 3 
                  ? 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-md' 
                  : 'bg-gradient-to-r from-primary to-blue-400 text-white shadow-md'
              }`}
              onClick={handleNext}
            >
              {currentStep === getStepCount() - 1 ? 'Complete' : 'Next'}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1">
                <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Hint */}
        <AnimatePresence>
          {showHint && getCurrentHint() && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-xl"
            >
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-yellow-500 flex-shrink-0">
                  <path d="M12 .75a8.25 8.25 0 00-4.135 15.39c.686.398 1.115 1.008 1.134 1.623a.75.75 0 00.577.706c.352.083.71.148 1.074.195.323.041.6-.218.6-.544v-4.661a6.75 6.75 0 1010.5 0v4.661c0 .326.277.585.6.544.364-.047.722-.112 1.074-.195a.75.75 0 00.577-.706c.02-.615.448-1.225 1.134-1.623A8.25 8.25 0 0012 .75z" />
                  <path fillRule="evenodd" d="M9.75 15.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75zm4.5 0a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-1">Hint</h4>
                  <p className="text-sm text-yellow-700">{getCurrentHint()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const TherapyPage = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { getTextSizeClass } = useAccessibility();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse URL query parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const mode = queryParams.get('mode');
    const category = queryParams.get('category');
    
    // Handle different modes
    if (mode === 'daily') {
      // Find a recommended exercise (not completed yet)
      const recommendedExercise = exercises.find(ex => !completedExercises.includes(ex.id));
      if (recommendedExercise) {
        setSelectedExercise(recommendedExercise);
      }
    } else if (mode === 'exercises') {
      // Just show the exercise list (default behavior)
    }
    
    // Set category if specified
    if (category && exerciseCategories.some(cat => cat.id === category)) {
      setSelectedCategory(category);
    }
  }, [location.search, completedExercises]);
  
  // Filter exercises by category and search query
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesCategory = selectedCategory ? exercise.category === selectedCategory : true;
      const matchesSearch = searchQuery 
        ? exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);
  
  const handleExerciseComplete = (exercise) => {
    if (!completedExercises.includes(exercise.id)) {
      setCompletedExercises([...completedExercises, exercise.id]);
    }
    setSelectedExercise(null);
  };
  
  const isExerciseCompleted = (exerciseId) => {
    return completedExercises.includes(exerciseId);
  };
  
  // Get progress percentage for a category
  const getCategoryProgress = (categoryId) => {
    const categoryExercises = exercises.filter(ex => ex.category === categoryId);
    if (categoryExercises.length === 0) return 0;
    
    const completedCount = categoryExercises.filter(ex => 
      completedExercises.includes(ex.id)
    ).length;
    
    return Math.round((completedCount / categoryExercises.length) * 100);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[var(--secondary-light)]">
      <Header />
      
      <main className="flex-1 px-4 py-4 max-w-screen-lg mx-auto w-full pb-safe">
        {selectedExercise ? (
          <ExerciseDetail 
            exercise={selectedExercise}
            onBack={() => setSelectedExercise(null)}
            onComplete={handleExerciseComplete}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ 
                fontFamily: 'var(--font-display)',
                color: 'var(--primary-dark)'
              }}>Speech Therapy</h1>
              <p className="text-sm md:text-base mb-6" style={{ color: 'var(--textSecondary)' }}>
                Practice your speech with these therapeutic exercises designed to improve various aspects of communication.
              </p>
              
              {/* Search bar */}
              <div className="relative mb-8">
                <input
                  type="text"
                  className="w-full p-4 pl-12 bg-white rounded-xl shadow-sm border border-gray-100 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
                  style={{ 
                    boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
                  }}
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  style={{ color: 'var(--textSecondary)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
                    style={{ color: 'var(--textSecondary)' }}
                    onClick={() => setSearchQuery('')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Category Pills */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--primary-dark)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }}>
                    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                  </svg>
                  Categories
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`category-pill px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === null 
                        ? 'text-white shadow-md' 
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ 
                      backgroundColor: selectedCategory === null ? 'var(--primary)' : '',
                      boxShadow: selectedCategory === null ? '0 4px 10px rgba(58, 111, 248, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Exercises
                  </motion.button>
                  
                  {exerciseCategories.map(category => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`category-pill px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center ${
                        selectedCategory === category.id 
                          ? `text-white shadow-md` 
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }`}
                      style={{ 
                        background: selectedCategory === category.id ? `linear-gradient(135deg, var(--primary-dark), var(--primary))` : '',
                        boxShadow: selectedCategory === category.id ? '0 4px 10px rgba(58, 111, 248, 0.2)' : '0 2px 5px rgba(0, 0, 0, 0.05)'
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/30">
                        {getCategoryProgress(category.id)}%
                      </span>
                    </motion.button>
                  ))}
                </div>
                
                {selectedCategory && (
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--primary-dark)' }}>
                        {exerciseCategories.find(c => c.id === selectedCategory)?.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--textSecondary)' }}>
                        {exerciseCategories.find(c => c.id === selectedCategory)?.description}
                      </p>
                    </div>
                    <button 
                      className="text-sm flex items-center"
                      style={{ color: 'var(--primary)' }}
                      onClick={() => setSelectedCategory(null)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      View All
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Exercises Grid */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--primary-dark)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2" style={{ color: 'var(--primary)' }}>
                  <path d="M11.7 2.805a.75.75 0 011.22-.872l3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
                {filteredExercises.length} {filteredExercises.length === 1 ? 'Exercise' : 'Exercises'} Available
              </h2>
              
              {filteredExercises.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {filteredExercises.map(exercise => (
                    <motion.div
                      key={exercise.id}
                      variants={{
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
                      }}
                    >
                      <ExerciseCard
                        exercise={exercise}
                        onSelect={() => setSelectedExercise(exercise)}
                        completed={isExerciseCompleted(exercise.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No exercises found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your search or category filters</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default TherapyPage;
