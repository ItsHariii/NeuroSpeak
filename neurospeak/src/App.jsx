import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CommunicationPage from './pages/CommunicationPage';
import BasicsPage from './pages/BasicsPage';
import NeedsPage from './pages/NeedsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import PeoplePage from './pages/PeoplePage';
import TherapyPage from './pages/TherapyPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const [hasDynamicIsland, setHasDynamicIsland] = useState(false);
  
  // Fix for iOS viewport height issue and detect Dynamic Island
  useEffect(() => {
    // Fix for 100vh in mobile browsers
    const setVh = () => {
      // First, prevent horizontal scrolling
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'auto';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';
      
      // Set the --vh custom property
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Detect iPhone models with notch/Dynamic Island
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const hasNotch = isIOS && 
        (window.screen.height / window.screen.width > 2 || 
         window.screen.width / window.screen.height > 2);
      
      setHasDynamicIsland(hasNotch);
      
      if (hasNotch) {
        document.documentElement.classList.add('has-dynamic-island');
      } else {
        document.documentElement.classList.remove('has-dynamic-island');
      }
    };

    // Set initial values
    setVh();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  return (
    <div className={`app-container ios-safe-area ${hasDynamicIsland ? 'has-dynamic-island' : ''}`}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/communicate" element={
          <ProtectedRoute>
            <CommunicationPage />
          </ProtectedRoute>
        } />
        <Route path="/basics" element={
          <ProtectedRoute>
            <BasicsPage />
          </ProtectedRoute>
        } />
        <Route path="/needs" element={
          <ProtectedRoute>
            <NeedsPage />
          </ProtectedRoute>
        } />
        <Route path="/activities" element={
          <ProtectedRoute>
            <ActivitiesPage />
          </ProtectedRoute>
        } />
        <Route path="/people" element={
          <ProtectedRoute>
            <PeoplePage />
          </ProtectedRoute>
        } />
        <Route path="/therapy" element={
          <ProtectedRoute>
            <TherapyPage />
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <ProgressPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <AppRoutes />
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
