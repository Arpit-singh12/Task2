export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'celebrity' | 'public';
  avatar: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  verified?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_post' | 'follow' | 'like' | 'comment';
  message: string;
  timestamp: number;
  read: boolean;
  relatedUserId?: string;
  relatedPostId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  posts: Post[];
  users: User[];
  notifications: Notification[];
  following: string[];
}