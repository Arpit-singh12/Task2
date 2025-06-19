import React, { useState } from 'react';
import { X, Image, Smile } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import API from '../api/axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { state, dispatch } = useApp();
  const [content, setContent] = useState('');
  const [selectedImage, setImage] = useState<string | null>(null);
  const [customImageURL, setCustomImageURL] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const { user } = state.auth;

  const sampleImages = [
    'https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1308881/pexels-photo-1308881.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];

  const handlePost = async () => {
    if (!content.trim()) return;

    const image = selectedImage || customImageURL || undefined;

    setIsPosting(true);
    try {
      const res = await API.post('/posts', {
        content,
        image
      });

      dispatch({
        type: 'ADD_POST',
        payload: {
          ...res.data,
          author: state.auth.user, 
        }
      });
      setContent('');
      setImage(null);
      setCustomImageURL('');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Post creation failed!');
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
                {user.verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            maxLength={280}
          />
          <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
            <span>{content.length}/280</span>
          </div>

          {/* Sample Image Selection */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Choose a sample image (optional)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {sampleImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setImage(selectedImage === img ? null : img);
                    setCustomImageURL('');
                  }}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === img
                      ? 'border-purple-500 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`Option ${index + 1}`} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom Image URL input */}
          <div className="mt-6">
            <label className="block text-sm text-gray-700 mb-1">
              Or paste image URL manually:
            </label>
            <input
              type="text"
              value={customImageURL}
              onChange={(e) => {
                setCustomImageURL(e.target.value);
                setImage(null);
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded-md text-sm bg-white/70"
            />
          </div>

          {/* Image Preview */}
          {(selectedImage || customImageURL) && (
            <div className="mt-4">
              <label className="text-sm text-gray-700 mb-1 block">Preview</label>
              <img
                src={selectedImage || customImageURL}
                alt="Post preview"
                className="w-full max-h-60 rounded-md object-cover shadow"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              content.trim() && !isPosting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPosting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Posting...
              </div>
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
