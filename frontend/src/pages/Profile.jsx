import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Calendar, Mail, Edit, BookOpen, Award, MessageSquare, Share2, X, MoreHorizontal, Trash2, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavbar from '../components/navbar/TopNavbar';
import postService from '../services/postService';
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { getFollowStats, getRelationship } from '../services/followService';
import FollowButton from '../components/FollowButton';
import FollowListModal from '../components/FollowListModal';
import CreatePostModal from '../components/CreatePostModal';
import Toast from '../components/toasts/Toast';

const Profile = () => {
  const { user: currentUser, getUserInitials, getRoleDisplay, getAvatarUrl, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [relationship, setRelationship] = useState({ isFollowing: false, isFollowedBy: false, isMutual: false });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'followers' });
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const isOwnProfile = !userId || String(currentUser?.id) === String(userId) || currentUser?.username === userId;

  useEffect(() => {
    const loadProfilePage = async () => {
      try {
        setIsProfileLoading(true);
        if (!currentUser) {
          return;
        }

        let activeProfileUser = currentUser;
        if (isOwnProfile) {
          activeProfileUser = await refreshUser();
        } else {
          let profileResponse;
          if (/^\d+$/.test(userId)) {
            profileResponse = await apiClient.get(`/users/${userId}`);
          } else {
            profileResponse = await apiClient.get(`/users/username/${userId}`);
          }
          activeProfileUser = profileResponse.data;

          // Increment profile views
          if (activeProfileUser?.username) {
            apiClient.post(`/users/${activeProfileUser.username}/view`).catch(err => console.error('Error incrementing views:', err));
          }
        }
        setProfileUser(activeProfileUser);

        if (activeProfileUser?.id) {
          const statsResponse = await getFollowStats(activeProfileUser.id);
          setFollowersCount(statsResponse.data?.followersCount || 0);
          setFollowingCount(statsResponse.data?.followingCount || 0);
        }

        if (!isOwnProfile && currentUser?.id && activeProfileUser?.id) {
          const relationshipResponse = await getRelationship(activeProfileUser.id);
          setRelationship(relationshipResponse.data || { isFollowing: false, isFollowedBy: false, isMutual: false });
        } else {
          setRelationship({ isFollowing: false, isFollowedBy: false, isMutual: false });
        }
      } catch (err) {
        console.error('Failed to load profile page:', err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfilePage();
  }, [currentUser?.id, userId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profileUser?.username) {
        return;
      }
      setIsLoadingPosts(true);
      try {
        const data = await postService.getUserPosts(profileUser.username);
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [profileUser?.username, postsRefreshKey]);

  // Re-fetch posts whenever a new post is created anywhere in the app
  useEffect(() => {
    const handlePostCreated = () => setPostsRefreshKey((k) => k + 1);
    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  // Comment handlers
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
      console.error('Failed to post comment:', error);
      showToast('Failed to post comment', 'error');
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

      // Decrement comment count in posts state
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      showToast('Failed to delete comment', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      showToast('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      showToast('Failed to delete post', 'error');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.isLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }

      // Update the post in state
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? (p.likeCount || 1) - 1 : (p.likeCount || 0) + 1
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to like/unlike post:', error);
      showToast('Failed to update like status', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser || isProfileLoading || !profileUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const getRoleBadgeColor = () => {
    switch (profileUser.role?.toUpperCase()) {
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

  const getEducationLevelDisplay = () => {
    if (!user.educationLevel) return null;
    const levels = {
      HIGH_SCHOOL: 'High School',
      UNDERGRADUATE: 'Undergraduate',
      POSTGRADUATE: 'Postgraduate',
      DOCTORATE: 'Doctorate'
    };
    return levels[user.educationLevel] || user.educationLevel;
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

  // Mock data - Replace with real data from backend
  const renderStudentProfile = (profile) => (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Education Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Education Level</p>
            <p className="font-semibold text-gray-900">{profile?.educationLevel || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date of Birth</p>
            <p className="font-semibold text-gray-900">{profile?.dateOfBirth || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Interests
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
            profile.interests.map((interest, index) => (
              <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                {interest}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No interests added yet.</p>
          )}
        </div>
      </div>
    </>
  );

  const renderTeacherProfile = (profile) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-blue-600" />
        Professional Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Institution</p>
          <p className="font-semibold text-gray-900">{profile?.institutionName || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Specialization</p>
          <p className="font-semibold text-gray-900">{profile?.subjectSpecialization || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );

  const renderInstituteProfile = (profile) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-blue-600" />
        Institution Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 mb-1">Type</p>
          <p className="font-semibold text-gray-900">{profile?.institutionType || 'Not specified'}</p>
        </div>
        <div>
          <p className="text-gray-500 mb-1">Registration Number</p>
          <p className="font-semibold text-gray-900">{profile?.registrationNumber || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-6 md:p-8">
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-md relative z-10 flex-shrink-0 border-4 border-gray-50 flex items-center justify-center overflow-hidden">
                    {getAvatarUrl(profileUser) ? (
                      <img
                        src={getAvatarUrl(profileUser)}
                        alt={profileUser.fullName || profileUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl md:text-4xl text-blue-600 font-bold">
                        {getUserInitials(profileUser)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 font-manrope">
                      {profileUser.fullName || profileUser.username}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor()}`}>
                        {getRoleDisplay(profileUser)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        @{profileUser.username}
                      </span>
                    </div>
                    {!isOwnProfile && relationship.isFollowedBy && (
                      <p className="mt-2 text-xs text-gray-500">Follows you</p>
                    )}
                  </div>
                </div>

                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/account/edit-profile')}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-sm flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/messages?userId=${profileUser.id}`)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition text-sm flex-shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                    <FollowButton
                      targetUserId={profileUser.id}
                      initialIsFollowing={relationship.isFollowing}
                      size="md"
                      onFollowChange={(newIsFollowing) => {
                        setRelationship((prev) => ({ ...prev, isFollowing: newIsFollowing }));
                        setFollowersCount((prev) => prev + (newIsFollowing ? 1 : -1));
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-gray-500 text-sm flex-wrap border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{profileUser.email}</span>
                </div>
                {profileUser.profile?.province && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{profileUser.profile.province}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, mode: 'followers' })}
                  className="font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  {followersCount} Followers
                </button>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, mode: 'following' })}
                  className="font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  {followingCount} Following
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {profileUser.role === 'STUDENT' && renderStudentProfile(profileUser.profile)}
              {profileUser.role === 'TEACHER' && renderTeacherProfile(profileUser.profile)}
              {profileUser.role === 'INSTITUTE' && renderInstituteProfile(profileUser.profile)}

              {isOwnProfile && (
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm p-4 md:p-6 mb-6 border border-gray-100 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                    {getAvatarUrl(currentUser) ? (
                      <img
                        src={getAvatarUrl(currentUser)}
                        alt={currentUser?.fullName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-sm">
                        {getUserInitials(currentUser)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-full py-3 px-4 text-sm md:text-base text-left transition-colors font-medium border-dashed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                  >
                    Share an academic update, ask a question, or start a discussion...
                  </button>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="hidden sm:flex px-4 py-2 bg-blue-600 text-white rounded-full font-medium shadow-sm transition-colors items-center gap-2 hover:bg-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span className="text-sm">Post</span>
                  </button>
                </div>
              )}

              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 font-manrope">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Recent Posts
                </h2>

                {isLoadingPosts ? (
                  <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium font-dm-sans text-sm">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 text-center py-12 border border-dashed border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-manrope">No posts yet</h3>
                    <p className="text-gray-500 text-sm font-dm-sans">No posts to show.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 pb-6 cursor-pointer hover:shadow-md transition-shadow p-6 group/post relative"
                      >
                        <div className="flex justify-between items-start mb-4 relative z-10" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-3" onClick={() => navigate(`/posts/${post.id}`)}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {post.author?.imageUrl ? (
                                <img src={post.author.imageUrl} alt="Author" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                currentUser?.initials || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{post.author?.fullName || post.author?.username}</p>
                              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                            </div>
                          </div>

                          {(isOwnProfile || currentUser?.role === 'ADMIN') && (
                            <div className="relative group/menu">
                              <button
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-50">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors font-medium rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete Post
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div onClick={() => navigate(`/posts/${post.id}`)}>
                          {post.content && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap font-dm-sans group-hover/post:text-gray-900 transition-colors">
                              {renderContentWithHashtags(post.content)}
                            </p>
                          )}
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt="Post image"
                              className="rounded-lg max-h-80 w-full object-cover mb-4 shadow-sm"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-gray-500 font-medium border-t border-gray-100 pt-3 mt-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1.5 text-sm hover:text-red-600 transition-colors cursor-pointer py-1 px-2 hover:bg-red-50 rounded-lg"
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current text-red-600' : ''}`} />
                            <span>{post.likeCount || 0}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComments(post.id);
                            }}
                            className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors py-1 px-2 hover:bg-blue-50 rounded-lg"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>{post.commentCount || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors py-1 px-2 hover:bg-blue-50 rounded-lg">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(post.id) && (
                          <div
                            className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Comment Input */}
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {currentUser?.initials || currentUser?.fullName?.[0] || 'U'}
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

                                        {/* Delete button for owned comments */}
                                        {(currentUser?.username === comment.authorUsername || currentUser?.role === 'ADMIN') && (
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
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      // Optionally scroll to posts section if needed, or do nothing.
                      // Keeping it clickable for UI consistency as requested.
                    }}>
                    <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                    onClick={() => setModalState({ isOpen: true, mode: 'followers' })}>
                    <p className="text-2xl font-bold text-blue-600">{followersCount}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Followers</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100"
                    onClick={() => setModalState({ isOpen: true, mode: 'following' })}>
                    <p className="text-2xl font-bold text-blue-600">{followingCount}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FollowListModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        userId={profileUser.id}
        mode={modalState.mode}
        title={modalState.mode === 'followers' ? 'Followers' : 'Following'}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCompleted={showToast}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Profile;
