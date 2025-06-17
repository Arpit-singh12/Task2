import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { DiscoverTab } from './components/DiscoverTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ProfileTab } from './components/ProfileTab';
import { CreatePostModal } from './components/CreatePostModal';

function AppContent() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(!state.auth.isAuthenticated);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  if (!state.auth.isAuthenticated) {
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
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
      />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'home' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Feed</h1>
              <p className="text-gray-600">Latest posts from everyone</p>
            </div>
            <Feed />
          </div>
        )}
        
        {activeTab === 'following' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
              <p className="text-gray-600">Posts from celebrities you follow</p>
            </div>
            <Feed showFollowingOnly={true} />
          </div>
        )}
        
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      <CreatePostModal 
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
      />
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