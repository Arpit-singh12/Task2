import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import API from '../api/axios';

interface Props {
  onContinue: () => void;
}

export default function LoginSignupScreen({ onContinue }: Props) {
  const { dispatch } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456'); // default/fixed for now
  const [role, setRole] = useState<'celebrity' | 'public'>('public');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=3');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return alert('Please fill all fields');

    setLoading(true);
    try {
      const endpoint = isSignUp ? '/auth/signup' : '/auth/login';
      const payload = isSignUp
        ? { username, password, displayName: username, role, avatar }
        : { username, password };

      const res = await API.post(endpoint, payload);

      if (isSignUp) {
        // Store new user in localStorage for AuthModal
        const existing = JSON.parse(localStorage.getItem('newUsers') || '[]');
        const updated = [...existing, res.data.user];
        localStorage.setItem('newUsers', JSON.stringify(updated));

        // Go to quick login modal
        onContinue();
      } else {
        // Login flow
        dispatch({ type: 'LOGIN', payload: res.data.user });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {isSignUp && (
            <>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'celebrity' | 'public')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <option value="public">Fan</option>
                <option value="celebrity">Celebrity</option>
              </select>

              <input
                type="text"
                placeholder="Avatar URL (optional)"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </>
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
        </button>

        <div className="mt-4 text-center text-sm text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-purple-600 font-medium hover:underline"
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button
            onClick={onContinue}
            className="text-gray-400 hover:text-purple-600 transition-all"
          >
            → Skip to quick login
          </button>
        </div>
      </div>
    </div>
  );
}
