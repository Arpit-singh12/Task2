import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { DiscoverTab } from './components/DiscoverTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ProfileTab } from './components/ProfileTab';
import { CreatePostModal } from './components/CreatePostModal';
import LoginSignupScreen from './components/LoginSignup';

function AppContent() {
  const { state, dispatch } = useApp();
  const { isAuthenticated } = state.auth;

  const [activeTab, setActiveTab] = useState('home');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  // UI flow states
  const [started, setStarted] = useState(false); // after "Get Started" button
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleTabChange = (tab: string) => setActiveTab(tab);
  const handleCreatePost = () => setShowCreatePostModal(true);

  // Load user from localStorage on first render
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN', payload: parsedUser });
        setStarted(true); // skip welcome page
      } catch (err) {
        console.error('Failed to parse stored user');
      }
    }
  }, [dispatch]);

  // Close auth modal if user logs in
  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthModal(false);
    }
  }, [isAuthenticated]);

  //Show welcome screen first
  if (!isAuthenticated && !started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <div className="w-10 h-10 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              SocialFeed
            </h1>
            <p className="text-gray-600 text-lg">Connect with your favorite celebrities</p>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Show Login/Signup Form if not logged in yet
  if (!isAuthenticated && started && !showAuthModal) {
    return <LoginSignupScreen onContinue={() => setShowAuthModal(true)} />;
  }

  // Show full app if logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Feed</h1>
              <p className="text-gray-600">Latest posts from everyone</p>
            </div>
            <Feed />
          </>
        )}

        {activeTab === 'following' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
              <p className="text-gray-600">Posts from celebrities you follow</p>
            </div>
            <Feed showFollowingOnly={true} />
          </>
        )}

        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />

      {/* AuthModal: used only if user clicked "continue to quick login" */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
