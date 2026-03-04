import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { postService } from '../services/postService';
import RoleBasedWidget from '../components/widgets/RoleBasedWidget';

const Home = () => {
  const { user, getUserInitials } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAllPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
      case 'TEACHER':
        return 'bg-purple-100 text-purple-700';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-700';
      case 'INSTITUTE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Role-Based Widget */}
      {/* <RoleBasedWidget /> */}

      {/* Feed Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No posts yet. Be the first to post!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                  {/* Author Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {post.author?.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm">{post.author?.initials || 'U'}</span>
                    )}
                  </div>

                  {/* Author Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {post.author?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(post.author?.role)}`}>
                        {post.author?.role || 'USER'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* More Options */}
                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              {post.content && (
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
              )}

              {/* Media (if any) */}
              {post.imageUrl && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Engagement Stats (Mocked for now since backend doesn't have it) */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 mb-3 border-b border-gray-100">
                <span>0 likes</span>
                <span>0 comments</span>
                <span>0 shares</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                  <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Like</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Comment</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition">
          Load more posts
        </button>
      </div>
    </div>
  );
};

export default Home;
