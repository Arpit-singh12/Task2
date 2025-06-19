import React, { useState, useEffect } from 'react';
import {
  UserPlus, Users, Star, TrendingUp, Sparkles, Crown,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { User as UserType } from '../types';
import API from '../api/axios';

export function DiscoverTab() {
  const { state, dispatch } = useApp();
  const { user, isAuthenticated } = state.auth;
  const [celebrities, setCelebrities] = useState<UserType[]>([]);
  const [animatedStats, setAnimatedStats] = useState({ celebrities: 0, following: 0, suggestions: 0 });

  //Fetch celebrities from backend
  useEffect(() => {
  const fetchCelebrities = async () => {
    try {
      const res = await API.get('/users/celebrities');
      const fetchedUsers = res.data.users.map((u: any) => ({
        ...u,
        id: u._id, // 🔁 Convert Mongo _id → id
      }));
      setCelebrities(fetchedUsers);
    } catch (err) {
      console.error('Failed to fetch celebrities:', err);
    }
  };

  if (isAuthenticated) fetchCelebrities();
}, [isAuthenticated]);


  const suggestedCelebrities = celebrities.filter(
    (celeb) => !state.following.includes(celeb.id) && celeb.id !== user?.id
  );

  // Animated Stats
  useEffect(() => {
    const targets = {
      celebrities: celebrities.length,
      following: state.following.length,
      suggestions: suggestedCelebrities.length,
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        celebrities: Math.floor(targets.celebrities * easeOut),
        following: Math.floor(targets.following * easeOut),
        suggestions: Math.floor(targets.suggestions * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targets);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [celebrities.length, state.following.length, suggestedCelebrities.length]);

  //Follow user...
  const handleFollow = async (celebrityId: string) => {
    try {
      await API.post(`/follow/${celebrityId}`);
      dispatch({ type: 'FOLLOW_USER', payload: celebrityId });
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  //Unfollow user....
  const handleUnfollow = async (celebrityId: string) => {
    try {
      await API.post(`/unfollow/${celebrityId}`);
      dispatch({ type: 'UNFOLLOW_USER', payload: celebrityId });
    } catch (err) {
      console.error('Failed to unfollow user:', err);
    }
  };

  const formatFollowerCount = (count: number | undefined) => {
    if (!count) return '0';
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center animate-pulse-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Discover</h1>
        </div>
        <p className="text-gray-600 text-lg">Find and follow your favorite celebrities</p>
      </div>

      {/* Animated Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-3d bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-3xl animate-slide-in-left stagger-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{animatedStats.celebrities}</div>
              <div className="text-purple-100">Total Celebrities</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-purple-100">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Growing daily</span>
          </div>
        </div>

        <div className="card-3d bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-6 rounded-3xl animate-slide-in-left stagger-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{animatedStats.following}</div>
              <div className="text-blue-100">Following</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-blue-100">
            <Star className="w-4 h-4" />
            <span className="text-sm">Your connections</span>
          </div>
        </div>

        <div className="card-3d bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-3xl animate-slide-in-left stagger-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold">{animatedStats.suggestions}</div>
              <div className="text-green-100">Suggestions</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-green-100">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Discover more</span>
          </div>
        </div>
      </div>

      {/* Celebrity List */}
      <div className="card-3d bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Featured Celebrities</h2>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {celebrities.map((celebrity, index) => {
            const isFollowing = state.following.includes(celebrity.id);
            const isOwnProfile = celebrity.id === user?.id;

            return (
              <div
                key={celebrity.id}
                className="p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={celebrity.avatar}
                      alt={celebrity.displayName}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300 group-hover:scale-105"
                    />
                    {celebrity.verified && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white animate-bounce-in shadow-lg">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {celebrity.displayName}
                      </h3>
                      <Crown className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-gray-500 mb-3 text-lg">@{celebrity.username}</p>
                    {celebrity.bio && (
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {celebrity.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {formatFollowerCount(celebrity.followerCount)}
                        </span>
                        <span>followers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        <span>Trending</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isOwnProfile && (
                      <button
                        onClick={() =>
                          isFollowing
                            ? handleUnfollow(celebrity.id)
                            : handleFollow(celebrity.id)
                        }
                        className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 btn-3d ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg animate-pulse-glow'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {isFollowing ? 'Following' : 'Follow'}
                        </div>
                      </button>
                    )}
                    {isOwnProfile && (
                      <div className="px-6 py-3 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-2xl text-sm font-semibold flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        You
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
