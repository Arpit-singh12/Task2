import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Post } from '../types';
import { useApp } from '../contexts/AppContext';

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { dispatch } = useApp();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    dispatch({
      type: post.isLiked ? 'UNLIKE_POST' : 'LIKE_POST',
      payload: post.id,
    });

    setIsLiking(false);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const author = post.author;

  if (!author) {
    return (
      <div className="p-6 border rounded-xl bg-white shadow text-gray-500">
        <p>Post author not available</p>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`card-3d bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-500 ${
        isVisible ? 'animate-fade-in' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 0.1}s`,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
      }}
    >
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <div className="relative">
          <img
            src={author.avatar}
            alt={author.displayName}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-100 transition-all duration-300 hover:ring-4 hover:ring-purple-200"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white animate-pulse-glow"></div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg hover:text-purple-600 transition-colors cursor-pointer">
              {author.displayName}
            </h3>
            {author.verified && (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce-in">
                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="hover:text-purple-600 transition-colors cursor-pointer">
              @{author.username}
            </span>
            <span>•</span>
            <span>{formatTimeAgo(post.timestamp)}</span>
          </div>
        </div>

        <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110 group">
          <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-900 leading-relaxed mb-6 text-lg">{post.content}</p>

        {post.image && !imageError && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 group">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={post.image}
              alt="Post content"
              className={`w-full h-80 object-cover transition-all duration-700 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-50 bg-gradient-to-r from-gray-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-3 transition-all duration-300 hover:scale-110 btn-3d group ${
                post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } ${isLiking ? 'animate-pulse' : ''}`}
            >
              <div className="relative">
                <Heart
                  className={`w-6 h-6 transition-all duration-300 ${
                    post.isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'
                  }`}
                />
                {isLiking && (
                  <div className="absolute inset-0 w-6 h-6 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                )}
              </div>
              <span className="text-sm font-semibold">{formatCount(post.likes)}</span>
            </button>

            <button className="flex items-center gap-3 text-gray-500 hover:text-blue-500 transition-all duration-300 hover:scale-110 btn-3d group">
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">{formatCount(post.comments)}</span>
            </button>

            <button className="flex items-center gap-3 text-gray-500 hover:text-green-500 transition-all duration-300 hover:scale-110 btn-3d group">
              <Share className="w-6 h-6 group-hover:scale-110 group-hover:rotate-12 transition-all" />
              <span className="text-sm font-semibold">Share</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
