import React, { useEffect, useState } from 'react';
import { Calendar, Users, Star, Edit } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import API from '../api/axios';
import { Post } from '../types';

export function ProfileTab() {
  const { state } = useApp();
  const { user } = state.auth;
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/posts/self');
        setUserPosts(res.data.posts);
      } catch (err) {
        console.error('Failed to load profile posts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPosts();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600"></div>
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative -mt-20">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {user.verified && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.displayName}</h1>
                {user.role === 'celebrity' && (
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-gray-500 text-lg mb-3">@{user.username}</p>
              {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(Date.now() - 365 * 24 * 60 * 60 * 1000)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {user.role === 'celebrity' && user.followerCount && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-semibold">
                      {formatCount(user.followerCount)}
                    </span>
                    <span className="text-gray-500">followers</span>
                  </div>
                )}

                {user.role === 'public' && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900 font-semibold">
                      {state.following.length}
                    </span>
                    <span className="text-gray-500">following</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 font-semibold">{userPosts.length}</span>
                  <span className="text-gray-500">posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {user.role === 'celebrity' ? 'Your Posts' : 'Your Activity'}
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-gray-500">Loading your posts...</div>
        ) : userPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Edit className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {user.role === 'celebrity' ? 'No posts yet' : 'No activity yet'}
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {user.role === 'celebrity'
                ? 'Start sharing your thoughts and updates with your followers!'
                : 'Follow some celebrities and interact with their posts to see your activity here!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {userPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-4">
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post content"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatDate(post.timestamp)}</span>
                      <span>•</span>
                      <span>{formatCount(post.likes)} likes</span>
                      <span>•</span>
                      <span>{formatCount(post.comments)} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
