import React, { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import API from '../api/axios';
import { X, User, Star, Sparkles, Crown } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { dispatch } = useApp();
  const [selectedRole, setSelectedRole] = useState<'celebrity' | 'public'>('public');
  const [isLoading, setIsLoading] = useState(false);
  const [userList, setUserList] = useState<UserType[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get('/users');
        setUserList(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        const fallback = JSON.parse(localStorage.getItem('newUsers') || '[]');
        setUserList(fallback);
      }
    };

    if (isOpen) fetchUsers();
  }, [isOpen]);

  const celebrities = userList.filter(user => user.role === 'celebrity');
  const publicUsers = userList.filter(user => user.role === 'public');

  const handleLogin = async (user: UserType) => {
    setIsLoading(true);
    try {
      const res = await API.post('/auth/login', {
        username: user.username,
        password: '123456',
      });

      const { token, user: loggedInUser } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      dispatch({ type: 'LOGIN', payload: loggedInUser });
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-morphism rounded-3xl p-8 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto animate-bounce-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Welcome</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-gray-700 mb-6 text-center">Choose your experience</p>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedRole('public')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 btn-3d group ${
                selectedRole === 'public'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
            >
              <User className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-semibold">Fan</div>
              <div className="text-xs text-gray-500 mt-1">Follow celebrities</div>
            </button>
            <button
              onClick={() => setSelectedRole('celebrity')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 btn-3d group ${
                selectedRole === 'celebrity'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
            >
              <Crown className="w-6 h-6 mx-auto mb-2 group-hover:scale-110 transition-transform text-yellow-500" />
              <div className="text-sm font-semibold">Celebrity</div>
              <div className="text-xs text-gray-500 mt-1">Create content</div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Quick Login - {selectedRole === 'celebrity' ? 'Celebrity' : 'Fan'} Accounts
          </h3>

          {(selectedRole === 'celebrity' ? celebrities : publicUsers).map((user, index) => (
            <button
              key={user.id || user._id || index}
              onClick={() => handleLogin(user)}
              disabled={isLoading}
              className="w-full p-4 rounded-2xl border border-gray-200 hover:border-purple-300 bg-white/50 hover:bg-white/80 transition-all duration-300 text-left group btn-3d animate-slide-in-left disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-100 group-hover:ring-purple-300 transition-all"
                  />
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white animate-bounce-in">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {user.displayName}
                    </div>
                    {user.role === 'celebrity' && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mb-1">@{user.username}</div>
                  {user.bio && (
                    <div className="text-xs text-gray-400 line-clamp-1">{user.bio}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4 animate-bounce-in">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-700 font-medium">Signing you in...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
