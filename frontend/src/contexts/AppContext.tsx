import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Post, Notification } from '../types';
import { mockUsers } from '../data/mockData';
import API from '../api/axios';

// Action Types

// ... (unchanged action types and reducer)

const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
  },
  posts: [],
  users: mockUsers,
  notifications: [],
  following: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
} | null>(null);

function appReducer(state: AppState, action: any): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true,
        },
      };

    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
        },
        following: [],
        notifications: [],
        posts: [],
      };

    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };

    case 'LOAD_MORE_POSTS': {
      const existingIds = new Set(state.posts.map((p) => p.id));
      const newPosts = action.payload.filter((p) => !existingIds.has(p.id));
      return {
        ...state,
        posts: [...state.posts, ...newPosts],
      };
    }

    case 'FOLLOW_USER':
      return {
        ...state,
        following: [...state.following, action.payload],
      };

    case 'UNFOLLOW_USER':
      return {
        ...state,
        following: state.following.filter((id) => id !== action.payload),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload
            ? { ...p, likes: p.likes + 1, isLiked: true }
            : p
        ),
      };

    case 'UNLIKE_POST':
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.payload
            ? { ...p, likes: p.likes - 1, isLiked: false }
            : p
        ),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore user from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      dispatch({ type: 'LOGIN', payload: JSON.parse(savedUser) });
    }
  }, []);

  // Load posts from backend after login
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await API.get('/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: 'LOAD_MORE_POSTS', payload: res.data.posts });
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };

    if (state.auth.isAuthenticated) {
      fetchPosts();
    }
  }, [state.auth.isAuthenticated]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
