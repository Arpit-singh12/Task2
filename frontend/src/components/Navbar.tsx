import React, { useState, useEffect } from 'react';
import { Home, Search, Bell, User, LogOut, Plus, Users, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

export function Navbar({ activeTab, onTabChange, onCreatePost }: NavbarProps) {
  const { state, dispatch } = useApp();
  const { user } = state.auth;
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', color: 'text-blue-500' },
    { id: 'following', icon: Users, label: 'Following', color: 'text-green-500' },
    { id: 'discover', icon: Search, label: 'Discover', color: 'text-purple-500' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-orange-500', badge: unreadCount },
    { id: 'profile', icon: User, label: 'Profile', color: 'text-indigo-500' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'glass-morphism shadow-xl backdrop-blur-xl' 
        : 'bg-white/95 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 animate-gradient-shift">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
              SocialFeed
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 btn-3d group ${
                    isActive
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="hidden sm:inline text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                  
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-notification-pop shadow-lg">
                      {item.badge > 9 ? '9+' : item.badge}
                    </div>
                  )}
                  
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}

            {user?.role === 'celebrity' && (
              <button
                onClick={onCreatePost}
                className="p-3 rounded-2xl text-white bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl btn-3d animate-pulse-glow group"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden sm:inline text-sm font-medium">Create</span>
                </div>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-3 rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 hover:scale-110 btn-3d group"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </div>
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 group">
            <div className="text-right hidden lg:block">
              <div className="text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {user?.displayName}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role}
              </div>
            </div>
            <div className="relative">
              <img
                src={user?.avatar}
                alt={user?.displayName}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200 transition-all duration-300 hover:ring-4 hover:ring-purple-300 hover:scale-105 cursor-pointer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}