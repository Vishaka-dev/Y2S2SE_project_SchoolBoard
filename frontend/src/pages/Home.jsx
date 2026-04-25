import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Pencil, Trash2, X, Smile, Download, ExternalLink, BookOpenText } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService } from '../services/postService';
import RoleBasedWidget from '../components/widgets/RoleBasedWidget';
import EditPostModal from '../components/EditPostModal';
import FollowButton from '../components/FollowButton';
import ReactionButton from '../components/ReactionButton';
import ResourceCard from '../components/resource-hub/ResourceCard';
import ShareModal from '../components/ShareModal';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { targetPostId } = useParams();
  const [posts, setPosts] = useState([]);
  const [singlePost, setSinglePost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSinglePostLoading, setIsSinglePostLoading] = useState(false);
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
  
  // Sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState(null);

  const handleShareClick = (e, post) => {
    e.stopPropagation();
    setShareContent(post);
    setIsShareModalOpen(true);
  };

  const handleShareSuccess = (postId) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, shareCount: (post.shareCount || 0) + 1 };
      }
      return post;
    }));

    setSinglePost(prev => {
      if (!prev || prev.id !== postId) return prev;
      return { ...prev, shareCount: (prev.shareCount || 0) + 1 };
    });
  };

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

  const loadSinglePost = async (postId) => {
    setIsSinglePostLoading(true);
    try {
      const data = await postService.getPostById(postId);
      setSinglePost(data);
    } catch (error) {
      console.error('Failed to fetch single post:', error);
      setSinglePost(null);
    } finally {
      setIsSinglePostLoading(false);
    }
  };

  useEffect(() => {
    if (targetPostId) {
      loadSinglePost(targetPostId);
    } else {
      setPage(0);
      loadPosts(0, true);
    }

    // Listen for new posts created from the modal
    const handlePostCreated = () => {
      if (!targetPostId) {
        setPage(0);
        loadPosts(0, true);
      }
    };

    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, [targetPostId]);

  // Handle scrolling to a specific post if a hash is present (Feed View only)
  useEffect(() => {
    if (!isLoading && !targetPostId && window.location.hash) {
      const id = window.location.hash.substring(1); // remove #
      const element = document.getElementById(id);
      
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50', 'bg-blue-50/30');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50', 'bg-blue-50/30');
          }, 3000);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, posts, targetPostId, window.location.hash]);

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
      
      // Update comments list (prepend for consistency with backend DESC order)
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));

      // Clear input and picker
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setShowCommentEmojiPicker(null);

      // Increment comment count in posts state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: (post.commentCount || 0) + 1 };
        }
        return post;
      }));

      setSinglePost(prev => {
        if (!prev || prev.id !== postId) return prev;
        return { ...prev, commentCount: (prev.commentCount || 0) + 1 };
      });
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
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));

      // Decrement comment count
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) };
        }
        return post;
      }));

      setSinglePost(prev => {
        if (!prev || prev.id !== postId) return prev;
        return { ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) };
      });
    } catch (error) {
      alert('Failed to delete comment: ' + (error.message || 'Unknown error'));
    }
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

      setSinglePost(prev => {
        if (!prev || prev.id !== postId) {
          return prev;
        }

        return {
          ...prev,
          reactionCounts: summary.reactionCounts,
          totalReactions: summary.totalReactions,
          currentUserReaction: summary.currentUserReaction
        };
      });
    } catch (error) {
      console.error('Failed to react to post:', error);
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
        {targetPostId ? (
          /* Focused Single Post View */
          isSinglePostLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium font-dm-sans">Loading post...</p>
            </div>
          ) : !singlePost ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                <X className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-manrope">Post not found</h3>
              <p className="text-gray-500 mb-6 font-dm-sans">The post you're looking for might have been deleted or is unavailable.</p>
              <button 
                onClick={() => navigate('/feed')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Back to Feed
              </button>
            </div>
          ) : (
            <div key={singlePost.id} className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition group/post relative ${isDeleting === singlePost.id ? 'opacity-50 grayscale' : ''}`}>
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex gap-3 cursor-pointer group/author"
                  onClick={() => {
                    if (singlePost.author?.id) {
                      navigate(`/profile/${singlePost.author.id}`);
                    } else if (singlePost.author?.username) {
                      navigate(`/profile/${singlePost.author.username}`);
                    }
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm overflow-hidden group-hover/author:opacity-90 transition-opacity">
                    {(singlePost.author?.imageUrl || singlePost.author?.avatar) ? (
                      <img
                        src={(singlePost.author?.imageUrl || singlePost.author?.avatar).startsWith('http')
                          ? (singlePost.author.imageUrl || singlePost.author.avatar)
                          : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(singlePost.author.imageUrl || singlePost.author.avatar).startsWith('/') ? (singlePost.author.imageUrl || singlePost.author.avatar) : '/' + (singlePost.author.imageUrl || singlePost.author.avatar)}`
                        }
                        alt={singlePost.author?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <span className={`avatar-fallback ${(singlePost.author?.imageUrl || singlePost.author?.avatar) ? 'hidden' : ''} text-sm`}>
                      {singlePost.author?.initials || singlePost.author?.fullName?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover/author:text-blue-600 transition-colors">
                      {singlePost.author?.name || 'Unknown User'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeColor(singlePost.author?.role)}`}>
                        {singlePost.author?.role || 'USER'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">{formatDate(singlePost.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user?.id !== singlePost.author?.id && (
                    <FollowButton
                      targetUserId={singlePost.author?.id}
                      initialIsFollowing={singlePost.author?.isFollowing || false}
                      size="sm"
                      onFollowChange={(newIsFollowing) => handleFollowChange(singlePost.author?.id, newIsFollowing)}
                    />
                  )}
                </div>
              </div>
              <div className="mb-4">
                {singlePost.content && (
                  <p className="text-gray-700 leading-relaxed font-dm-sans whitespace-pre-wrap">
                    {renderContentWithHashtags(singlePost.content)}
                  </p>
                )}
              </div>
              {(singlePost.imageUrl || singlePost.postImageUrl) && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                  <img
                    src={(singlePost.imageUrl || singlePost.postImageUrl).startsWith('http')
                      ? (singlePost.imageUrl || singlePost.postImageUrl)
                      : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(singlePost.imageUrl || singlePost.postImageUrl).startsWith('/') ? (singlePost.imageUrl || singlePost.postImageUrl) : '/' + (singlePost.imageUrl || singlePost.postImageUrl)}`
                    }
                    alt="Post content"
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              )}
              <div className="flex items-center gap-4 text-[13px] text-gray-500 pb-3 mb-3 border-b border-gray-50 font-medium">
                {singlePost.totalReactions > 0 ? (
                  <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                    <span className="text-base">👍</span> {singlePost.totalReactions}
                  </span>
                ) : (
                  <span className="hover:text-blue-600 cursor-pointer">0 reactions</span>
                )}
                <span
                  className="hover:text-blue-600 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComments(singlePost.id);
                  }}
                >
                  {singlePost.commentCount || 0} comments
                </span>
                <span className="hover:text-blue-600 cursor-pointer">{singlePost.shareCount || 0} shares</span>
              </div>
              <div className="flex items-center gap-2 h-11">
                <ReactionButton
                  currentUserReaction={singlePost.currentUserReaction}
                  onReact={(reactionType) => handleReact(singlePost.id, reactionType)}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComments(singlePost.id);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn"
                >
                  <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Comment</span>
                </button>
                <button
                  onClick={(e) => handleShareClick(e, singlePost)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn"
                >
                  <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Share</span>
                </button>
              </div>
              {renderCommentsSection(singlePost)}
            </div>
          )
        ) : (
          /* Normal Feed View */
          <>
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
                  <div 
                    key={post.id} 
                    id={`post-${post.id}`}
                    onClick={() => navigate(`/posts/${post.id}`)}
                    className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer group/post relative ${isDeleting === post.id ? 'opacity-50 grayscale' : ''}`}
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="flex gap-3 cursor-pointer group/author"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (post.author?.id) {
                            navigate(`/profile/${post.author.id}`);
                          } else if (post.author?.username) {
                            navigate(`/profile/${post.author.username}`);
                          }
                        }}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm overflow-hidden group-hover/author:opacity-90 transition-opacity">
                          {(post.author?.imageUrl || post.author?.avatar) ? (
                            <img
                              src={(post.author?.imageUrl || post.author?.avatar).startsWith('http')
                                ? (post.author.imageUrl || post.author.avatar)
                                : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(post.author.imageUrl || post.author.avatar).startsWith('/') ? (post.author.imageUrl || post.author.avatar) : '/' + (post.author.imageUrl || post.author.avatar)}`
                              }
                              alt={post.author?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <span className={`avatar-fallback ${(post.author?.imageUrl || post.author?.avatar) ? 'hidden' : ''} text-sm`}>
                            {post.author?.initials || post.author?.fullName?.[0] || 'U'}
                          </span>
                        </div>
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
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {user?.id !== post.author?.id && (
                          <FollowButton
                            targetUserId={post.author?.id}
                            initialIsFollowing={post.author?.isFollowing || false}
                            size="sm"
                            onFollowChange={(newIsFollowing) => handleFollowChange(post.author?.id, newIsFollowing)}
                          />
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
                    <div className="mb-4">
                      {post.content && (
                        <p className="text-gray-700 leading-relaxed font-dm-sans whitespace-pre-wrap">
                          {renderContentWithHashtags(post.content)}
                        </p>
                      )}
                    </div>
                    {(post.imageUrl || post.postImageUrl) && (
                      <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                        <img
                          src={(post.imageUrl || post.postImageUrl).startsWith('http')
                            ? (post.imageUrl || post.postImageUrl)
                            : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '')}${(post.imageUrl || post.postImageUrl).startsWith('/') ? (post.imageUrl || post.postImageUrl) : '/' + (post.imageUrl || post.postImageUrl)}`
                          }
                          alt="Post content"
                          className="w-full h-auto max-h-[500px] object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[13px] text-gray-500 pb-3 mb-3 border-b border-gray-50 font-medium">
                      {post.totalReactions > 0 ? (
                        <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                          <span className="text-base">👍</span> {post.totalReactions}
                        </span>
                      ) : (
                        <span className="hover:text-blue-600 cursor-pointer">0 reactions</span>
                      )}
                      <span
                        className="hover:text-blue-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComments(post.id);
                        }}
                      >
                        {post.commentCount || 0} comments
                      </span>
                      <span className="hover:text-blue-600 cursor-pointer">{post.shareCount || 0} shares</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 h-11" onClick={(e) => e.stopPropagation()}>
                      <ReactionButton 
                        currentUserReaction={post.currentUserReaction} 
                        onReact={(reactionType) => handleReact(post.id, reactionType)} 
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComments(post.id);
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn"
                      >
                        <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Comment</span>
                      </button>
                      <button 
                        onClick={(e) => handleShareClick(e, post)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn"
                      >
                        <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Share</span>
                      </button>
                    </div>
                    {renderCommentsSection(post)}
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
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        content={shareContent}
        contentType="POST"
        onShared={handleShareSuccess}
      />
    </div>
  );
};

export default Home;
