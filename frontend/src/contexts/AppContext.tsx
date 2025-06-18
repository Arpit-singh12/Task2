import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Post, Notification } from '../types';
import API from '../api/axios';

type AppAction = 
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'LOAD_MORE_POSTS'; payload: Post[] }
  | { type: 'FOLLOW_USER'; payload: string }
  | { type: 'UNFOLLOW_USER'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'UNLIKE_POST'; payload: string };

const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false,
  },
  posts: [],
  users: [],
  notifications: [],
  following: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
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
      localStorage.removeItem('token');
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false,
        },
        following: [],
        notifications: [],
      };
    
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };
    
    case 'LOAD_MORE_POSTS': {
      const existingIds = new Set(state.posts.map(p => p.id));
      const newPosts = action.payload.filter(p => !existingIds.has(p.id));
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
        following: state.following.filter(id => id !== action.payload),
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(p => 
          p.id === action.payload 
            ? { ...p, likes: p.likes + 1, isLiked: true }
            : p
        ),
      };
    
    case 'UNLIKE_POST':
      return {
        ...state,
        posts: state.posts.map(p => 
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res => {
          dispatch({ type: 'LOGIN', payload: res.data.user });
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
