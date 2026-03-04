import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { postService } from '../services/postService';
import RoleBasedWidget from '../components/widgets/RoleBasedWidget';
import EditPostModal from '../components/EditPostModal';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const POSTS_PER_PAGE = 10;

  const loadPosts = async (pageToLoad, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      const data = await postService.getAllPosts(pageToLoad, POSTS_PER_PAGE);
      if (isInitial) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      // If we got fewer posts than requested, we've reached the end
      if (data.length < POSTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(0, true);

    // Listen for new posts created from the modal
    const handlePostCreated = () => {
      setPage(0);
      loadPosts(0, true);
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(postId);
    try {
      await postService.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenu(null);
    } catch (error) {
      alert('Failed to delete post: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeleting(null);
    }
  };

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
      {/* Feed Posts */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium font-dm-sans">Loading your feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <MessageCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-manrope">No posts yet</h3>
            <p className="text-gray-500 mb-6 font-dm-sans">Be the first to share something with the community!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div key={post.id} className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group/post relative ${isDeleting === post.id ? 'opacity-50 grayscale' : ''}`}>
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-3">
                    {/* Author Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
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
                      <h3 className="text-sm font-bold text-gray-900 group-hover/post:text-blue-600 transition-colors">
                        {post.author?.name || 'Unknown User'}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeColor(post.author?.role)}`}>
                          {post.author?.role || 'USER'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* More Options / Menu */}
                  <div className="relative">
                    {(user?.username === post.author?.username || user?.role === 'ADMIN') && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === post.id ? null : post.id);
                          }}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeMenu === post.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => {
                                setEditingPost(post);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="font-semibold">Edit Post</span>
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="font-semibold">Delete Post</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="text-gray-700 mb-4 leading-relaxed font-dm-sans whitespace-pre-wrap">{post.content}</p>
                )}

                {/* Media (if any) */}
                {post.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <img
                      src={post.imageUrl}
                      alt="Post content"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onError={(e) => {
                        console.error('Image load failed:', post.imageUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-[13px] text-gray-500 pb-3 mb-3 border-b border-gray-50 font-medium">
                  <span className="hover:text-blue-600 cursor-pointer">0 likes</span>
                  <span className="hover:text-blue-600 cursor-pointer">0 comments</span>
                  <span className="hover:text-blue-600 cursor-pointer">0 shares</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn">
                    <ThumbsUp className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Like</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn">
                    <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn">
                    <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Share</span>
                  </button>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="px-8 py-3 bg-white text-blue-600 border border-blue-100 hover:border-blue-600 hover:bg-blue-50 rounded-full font-bold text-sm transition shadow-sm disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isFetchingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    'Load more posts'
                  )}
                </button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-gray-400 font-medium text-sm">
                You've reached the end of the feed ✨
              </div>
            )}
          </>
        )}
      </div>

      {editingPost && (
        <EditPostModal
          isOpen={true}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onPostCompleted={(msg, type) => {
            // Re-fetch to show updates
            if (type === 'success') {
              setPage(0);
              loadPosts(0, true);
            }
            alert(msg);
          }}
        />
      )}
    </div>
  );
};

export default Home;
