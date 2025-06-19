import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PostCard } from './PostCard';
import { useApp } from '../contexts/AppContext';
import { Post } from '../types';
import API from '../api/axios';
import { Sparkles, TrendingUp } from 'lucide-react';

interface FeedProps {
  showFollowingOnly?: boolean;
}

export function Feed({ showFollowingOnly = false }: FeedProps) {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver>();

  const filteredPosts = showFollowingOnly
    ? state.posts.filter(post => state.following.includes(post.authorId))
    : state.posts;

  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await API.get(`/posts?page=${page}&limit=10`);
      console.log('Post Extracted: ', res.data);

      const newPosts: Post[] = res.data.posts;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        dispatch({ type: 'LOAD_MORE_POSTS', payload: newPosts });
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading, dispatch]);

  useEffect(() => {
    if (state.posts.length === 0 && !showFollowingOnly) {
      fetchPosts();
    }
  }, [state.posts.length, showFollowingOnly, fetchPosts]);

  const lastPostRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, fetchPosts]);

  if (filteredPosts.length === 0 && showFollowingOnly) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="mx-auto w-16 h-16 text-purple-500 mb-4" />
        <h2 className="text-xl font-bold">No posts yet</h2>
        <p className="text-gray-500">Follow some celebrities to see their updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredPosts.map((post, index) => (
        <div
          key={post.id}
          ref={index === filteredPosts.length - 1 ? lastPostRef : undefined}
        >
          <PostCard post={post} index={index} />
        </div>
      ))}

      {loading && (
        <div className="text-center text-gray-500">Loading...</div>
      )}
    </div>
  );
}
