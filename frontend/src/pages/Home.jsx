import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
<<<<<<< Updated upstream
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
=======
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2, X, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate, useParams } from 'react-router-dom';
>>>>>>> Stashed changes
import { postService } from '../services/postService';
import RoleBasedWidget from '../components/widgets/RoleBasedWidget';
import EditPostModal from '../components/EditPostModal';
import FollowButton from '../components/FollowButton';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState({});
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(null); // stores postId
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
    setPage(0);
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

  const handleFollowChange = (authorId, newIsFollowing) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.author?.id === authorId) {
        return {
          ...post,
          author: {
            ...post.author,
            isFollowing: newIsFollowing
          }
        };
      }
      return post;
    }));
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

  const handleLike = async (postId, currentIsLiked) => {
    // Optimistic UI update
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const newIsLiked = !currentIsLiked;
        const newLikeCount = newIsLiked 
          ? (post.likeCount || 0) + 1 
          : Math.max(0, (post.likeCount || 0) - 1);
        
        return { 
          ...post, 
          isLiked: newIsLiked, 
          likeCount: newLikeCount 
        };
      }
      return post;
    }));

    try {
      if (currentIsLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          const originalIsLiked = currentIsLiked;
          const originalLikeCount = originalIsLiked 
            ? (post.likeCount || 0) 
            : (post.likeCount || 0); // This logic is tricky, but basically we want the original state
          
          // Re-fetch or just toggle back
          return { 
            ...post, 
            isLiked: originalIsLiked, 
            likeCount: originalIsLiked 
              ? (post.likeCount) // If it was liked, and we failed to unlike, keep it liked
              : (post.likeCount) // If it wasn't liked, and we failed to like, keep it unliked
          };
        }
        return post;
      }));
      // For simplicity, just refresh the feed or part of it if it fails
      // loadPosts(page, false); 
    }
  };

  const handleToggleComments = async (postId) => {
    const isExpanded = expandedComments.has(postId);
    const newExpanded = new Set(expandedComments);

    if (isExpanded) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Fetch comments if not already loaded or to refresh
      try {
        const comments = await postService.getCommentsByPost(postId);
        setCommentsByPost(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
    setExpandedComments(newExpanded);
  };

  const handleSubmitComment = async (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const newComment = await postService.createComment(postId, content);
      
      // Update comments list
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

      // Clear input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));

      // Increment comment count in posts state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: (post.commentCount || 0) + 1 };
        }
        return post;
      }));
    } catch (error) {
      alert('Failed to post comment: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await postService.deleteComment(commentId);
      
      // Update comments list
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));

      // Decrement comment count
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) };
        }
        return post;
      }));
    } catch (error) {
      alert('Failed to delete comment: ' + (error.message || 'Unknown error'));
    }
<<<<<<< Updated upstream
=======
    };

  const renderCommentsSection = (post) => {
    if (!expandedComments.has(post.id)) return null;

    return (
      <div
        className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.initials || user?.fullName?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 flex gap-2 items-center relative">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 pr-10 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCommentEmojiPicker(showCommentEmojiPicker === post.id ? null : post.id)}
                className="absolute right-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showCommentEmojiPicker === post.id && (
                <div 
                  className="absolute bottom-full right-0 mb-2 shadow-xl rounded-lg z-[60]"
                  onMouseLeave={() => setShowCommentEmojiPicker(null)}
                >
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setCommentInputs(prev => ({ 
                        ...prev, 
                        [post.id]: (prev[post.id] || '') + emojiObject.emoji 
                      }));
                    }}
                    autoFocusSearch={false}
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>
            
            <button
              onClick={() => handleSubmitComment(post.id)}
              disabled={!commentInputs[post.id]?.trim() || isSubmittingComment[post.id]}
              className="text-blue-600 font-bold text-sm px-2 disabled:opacity-50 hover:text-blue-700 transition-colors"
            >
              {isSubmittingComment[post.id] ? '...' : 'Post'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {commentsByPost[post.id]?.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-2">No comments yet. Be the first to comment!</p>
          ) : (
            commentsByPost[post.id]?.map((comment) => (
              <div key={comment.id} className="flex gap-3 group/comment">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                  {comment.authorImageUrl ? (
                    <img
                      src={comment.authorImageUrl.startsWith('http')
                        ? comment.authorImageUrl
                        : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${comment.authorImageUrl.startsWith('/') ? comment.authorImageUrl : '/' + comment.authorImageUrl}`
                      }
                      alt={comment.authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <span className={`avatar-fallback ${comment.authorImageUrl ? 'hidden' : ''}`}>
                    {comment.authorName?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl px-4 py-2 relative">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-bold text-gray-900">{comment.authorName || 'Unknown User'}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-dm-sans">
                      {comment.content}
                    </p>

                    {(user?.username === comment.authorUsername || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id, post.id)}
                        className="absolute -right-2 -top-2 p-1.5 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const handleReact = async (postId, reactionType) => {
    try {
      const summary = await postService.reactToPost(postId, reactionType);
      
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            reactionCounts: summary.reactionCounts,
            totalReactions: summary.totalReactions,
            currentUserReaction: summary.currentUserReaction
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to react to post:', error);
    }
>>>>>>> Stashed changes
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

  const renderContentWithHashtags = (content) => {
    if (!content) return null;

    const parts = content.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-600 font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
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
                  <div
                    className="flex gap-3 cursor-pointer group/author"
                    onClick={() => {
                      if (post.author?.id) {
                        navigate(`/profile/${post.author.id}`);
                      } else if (post.author?.username) {
                        // Fallback if ID is missing but username exists (e.g. cached posts)
                        navigate(`/profile/${post.author.username}`);
                      }
                    }}
                  >
                    {/* Author Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm overflow-hidden group-hover/author:opacity-90 transition-opacity">
                      {(post.author?.imageUrl || post.author?.avatar) ? (
                        <img
                          src={(post.author?.imageUrl || post.author?.avatar).startsWith('http')
                            ? (post.author.imageUrl || post.author.avatar)
                            : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(post.author.imageUrl || post.author.avatar).startsWith('/') ? (post.author.imageUrl || post.author.avatar) : '/' + (post.author.imageUrl || post.author.avatar)}`
                          }
                          alt={post.author?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            // Logic to show fallback initials if needed
                            const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`avatar-fallback ${(post.author?.imageUrl || post.author?.avatar) ? 'hidden' : ''} text-sm`}>
                        {post.author?.initials || post.author?.fullName?.[0] || 'U'}
                      </span>
                    </div>

                    {/* Author Info */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover/author:text-blue-600 transition-colors">
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

                  {/* Action & Menu Container */}
                  <div className="flex items-center gap-3">
                    {user?.id !== post.author?.id && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <FollowButton
                          targetUserId={post.author?.id}
                          initialIsFollowing={post.author?.isFollowing || false}
                          size="sm"
                          onFollowChange={(newIsFollowing) => handleFollowChange(post.author?.id, newIsFollowing)}
                        />
                      </div>
                    )}

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
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  {post.content && (
                    <p className="text-gray-700 leading-relaxed font-dm-sans whitespace-pre-wrap">
                      {renderContentWithHashtags(post.content)}
                    </p>
                  )}
                </div>

                {/* Media (if any) */}
                {(post.imageUrl || post.postImageUrl) && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <img
                      src={(post.imageUrl || post.postImageUrl).startsWith('http')
                        ? (post.imageUrl || post.postImageUrl)
                        : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(post.imageUrl || post.postImageUrl).startsWith('/') ? (post.imageUrl || post.postImageUrl) : '/' + (post.imageUrl || post.postImageUrl)}`
                      }
                      alt="Post content"
                      className="w-full h-auto max-h-[500px] object-contain"
                      onError={(e) => {
                        console.error('Image load failed:', (post.imageUrl || post.postImageUrl));
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-[13px] text-gray-500 pb-3 mb-3 border-b border-gray-50 font-medium">
                  <span className="hover:text-blue-600 cursor-pointer">{post.likeCount || 0} likes</span>
                  <span className="hover:text-blue-600 cursor-pointer" onClick={() => handleToggleComments(post.id)}>
                    {post.commentCount || 0} comments
                  </span>
                  <span className="hover:text-blue-600 cursor-pointer">0 shares</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleLike(post.id, post.isLiked)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition group/btn ${post.isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 group-hover/btn:scale-110 transition-transform ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-bold">{post.isLiked ? 'Liked' : 'Like'}</span>
                  </button>
                  <button 
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition group/btn ${expandedComments.has(post.id) ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    <MessageCircle className={`w-4 h-4 group-hover/btn:scale-110 transition-transform ${expandedComments.has(post.id) ? 'fill-current' : ''}`} />
                    <span className="text-sm font-bold">Comment</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn">
                    <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-sm font-bold">Share</span>
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments.has(post.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user?.initials || user?.fullName?.[0] || 'U'}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                          className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <button
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim() || isSubmittingComment[post.id]}
                          className="text-blue-600 font-bold text-sm px-2 disabled:opacity-50 hover:text-blue-700 transition-colors"
                        >
                          {isSubmittingComment[post.id] ? '...' : 'Post'}
                        </button>
                      </div>
                    </div>

                    {/* Comment List */}
                    <div className="space-y-4">
                      {commentsByPost[post.id]?.length === 0 ? (
                        <p className="text-center text-gray-400 text-xs py-2">No comments yet. Be the first to comment!</p>
                      ) : (
                        commentsByPost[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3 group/comment">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold flex-shrink-0">
                              {comment.author?.initials || comment.author?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-2xl px-4 py-2 relative">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-gray-900">{comment.author?.name}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed font-dm-sans">
                                  {comment.content}
                                </p>
                                
                                {/* Delete button for owned comments */}
                                {(user?.username === comment.author?.username || user?.role === 'ADMIN') && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id, post.id)}
                                    className="absolute -right-2 -top-2 p-1.5 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all hover:scale-110"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
