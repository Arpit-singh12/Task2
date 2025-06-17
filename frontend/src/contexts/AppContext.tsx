import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, User, Post, Notification } from '../types';
import { mockUsers, mockPosts } from '../data/mockData';

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
  users: mockUsers,
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
    
    case 'LOAD_MORE_POSTS':
      { const existingIds = new Set(state.posts.map(p => p.id));
      const newPosts = action.payload.filter(p => !existingIds.has(p.id));
      return {
        ...state,
        posts: [...state.posts, ...newPosts],
      }; }
    
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

  // Load initial data
  useEffect(() => {
    // Load initial posts
    const initialPosts = mockPosts.slice(0, 10);
    dispatch({ type: 'LOAD_MORE_POSTS', payload: initialPosts });

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (state.auth.isAuthenticated && state.following.length > 0) {
        // Randomly generate new posts from followed celebrities
        const followedCelebrities = state.users.filter(u => 
          u.role === 'celebrity' && state.following.includes(u.id)
        );
        
        if (followedCelebrities.length > 0 && Math.random() < 0.3) {
          const randomCelebrity = followedCelebrities[Math.floor(Math.random() * followedCelebrities.length)];
          const newPost: Post = {
            id: `post-${Date.now()}-${Math.random()}`,
            authorId: randomCelebrity.id,
            author: randomCelebrity,
            content: `New update from ${randomCelebrity.displayName}! 🎉`,
            timestamp: Date.now(),
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 20),
          };
          
          dispatch({ type: 'ADD_POST', payload: newPost });
          
          // Add notification
          const notification: Notification = {
            id: `notif-${Date.now()}`,
            userId: state.auth.user?.id || '',
            type: 'new_post',
            message: `${randomCelebrity.displayName} posted something new!`,
            timestamp: Date.now(),
            read: false,
            relatedUserId: randomCelebrity.id,
            relatedPostId: newPost.id,
          };
          
          dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
        }
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [state.auth.isAuthenticated, state.following.length]);

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