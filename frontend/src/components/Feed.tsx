import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { useApp } from '../contexts/AppContext';
import { Post } from '../types';
import { Sparkles, TrendingUp } from 'lucide-react';
import API from '../api/axios';

interface FeedProps {
  showFollowingOnly?: boolean;
}

export function Feed({ showFollowingOnly = false }: FeedProps) {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver>();
  const feedRef = useRef<HTMLDivElement>(null);

  const filteredPosts = showFollowingOnly
    ? state.posts.filter(post => state.following.includes(post.authorId))
    : state.posts;

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load paginated posts from backend
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await API.get(`/posts?page=${page}&limit=10`);
      const newPosts: Post[] = res.data.posts;

      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
      } else {
        dispatch({ type: 'LOAD_MORE_POSTS', payload: newPosts });
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, dispatch]);

  useEffect(() => {
    // Load initial posts on first render
    if (!showFollowingOnly && state.posts.length === 0) {
      loadMorePosts();
    }
  }, [showFollowingOnly, state.posts.length, loadMorePosts]);

  const lastPostRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      }, { threshold: 1.0 });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMorePosts]
  );

  if (filteredPosts.length === 0 && showFollowingOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center animate-float">
            <Sparkles className="w-16 h-16 text-purple-400" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce-in"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3 gradient-text">No posts yet</h3>
        <p className="text-gray-500 max-w-md mx-auto text-lg leading-relaxed">
          Follow some celebrities to see their latest posts in your personalized feed!
        </p>
        <div className="mt-8 flex items-center gap-2 text-sm text-purple-600">
          <TrendingUp className="w-4 h-4" />
          <span>Discover trending celebrities</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={feedRef} className="relative">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm font-medium animate-bounce-in">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Feed</span>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-8">
        {filteredPosts.map((post, index) => (
          <div
            key={post.id || `${post.timestamp}-${index}`}
            ref={index === filteredPosts.length - 1 ? lastPostRef : undefined}
          >
            {post.author ? (
              <PostCard post={post} index={index} />
            ) : (
              <div className="text-center text-gray-400">Post author not available</div>
            )}
          </div>
        ))}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* No More Posts */}
      {!hasMore && filteredPosts.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-8">You’ve reached the end 🎉</div>
      )}
    </div>
  );
}
