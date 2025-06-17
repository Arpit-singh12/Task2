import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { useApp } from '../contexts/AppContext';
import { mockPosts } from '../data/mockData';
import { Post } from '../types';
import { Sparkles, TrendingUp } from 'lucide-react';

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

  // Scroll progress tracking
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

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    // Simulate API delay with smooth loading
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const startIndex = page * 10;
    const endIndex = startIndex + 10;
    const newPosts = mockPosts.slice(startIndex, endIndex);
    
    if (newPosts.length === 0) {
      setHasMore(false);
    } else {
      dispatch({ type: 'LOAD_MORE_POSTS', payload: newPosts });
      setPage(prev => prev + 1);
    }
    
    setLoading(false);
  }, [page, loading, hasMore, dispatch]);

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, loadMorePosts]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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

      {/* Feed Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-purple-700 text-sm font-medium animate-bounce-in">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Feed</span>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="space-y-8">
        {filteredPosts.map((post, index) => (
          <div
            key={post.id}
            ref={index === filteredPosts.length - 1 ? lastPostElementRef : undefined}
            className="perspective-container"
          >
            <PostCard post={post} index={index} />
          </div>
        ))}
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium">Loading amazing content...</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce stagger-1"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce stagger-2"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce stagger-3"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* End of Feed */}
      {!hasMore && filteredPosts.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-100">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold gradient-text mb-2">You're all caught up!</h3>
              <p className="text-gray-600">You've seen all the latest posts 🎉</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Hints */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-40">
        {scrollProgress > 50 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 btn-3d animate-bounce-in"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
}