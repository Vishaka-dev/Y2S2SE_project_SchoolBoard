import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Trash2, Crown, Loader2, LogIn, LogOut, Calendar, BookOpen, GraduationCap, Pencil, MessageSquare, PlusCircle, Paperclip, MessageCircle, X, Smile, MoreVertical, Share2, Download, ExternalLink, BookOpenText } from 'lucide-react';
import groupService from '../services/groupService';
import { GROUP_TYPE_CONFIG } from '../components/GroupCard';
import GroupMembersModal from '../components/GroupMembersModal';
import { postService } from '../services/postService';
import resourceHubService from '../services/resourceHubService';
import CreatePostModal from '../components/CreatePostModal';
import ResourceUploadModal from '../components/resource-hub/ResourceUploadModal';
import ResourceCard from '../components/resource-hub/ResourceCard';
import ReactionButton from '../components/ReactionButton';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  // Group Feed State
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  const initialResourceForm = { title: '', description: '', category: 'STEM', type: 'DOCUMENT', externalUrl: '', tagsInput: '' };
  const [resourceForm, setResourceForm] = useState(initialResourceForm);
  const [resourceFile, setResourceFile] = useState(null);
  const [isResourceSubmitting, setIsResourceSubmitting] = useState(false);
  const [resourceFormError, setResourceFormError] = useState('');
  const fileInputRef = useRef(null);

  const deleteTargetRef = useRef(null);

  // Comment and Reaction States
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState({});
  const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(null);

  // Sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState(null);

  const handleShareClick = (e, item) => {
    if (e) e.stopPropagation();
    setShareContent(item);
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    if (groupId) {
      loadGroup();
      loadFeeds();
    }
  }, [groupId]);

  const loadFeeds = async () => {
    setFeedLoading(true);
    try {
      const [postsReq, resourcesReq] = await Promise.all([
        postService.getAllPosts(0, 100, groupId),
        resourceHubService.getResources({ page: 0, size: 100, groupId })
      ]);
      
      const posts = postsReq.map(p => ({ ...p, feedType: 'post' }));
      const resources = resourcesReq.resources.map(r => ({ ...r, feedType: 'resource' }));
      
      const merged = [...posts, ...resources].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setFeedItems(merged);
    } catch(err) {
      console.error("Failed to load group feeds", err);
    } finally {
      setFeedLoading(false);
    }
  };

  const loadGroup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await groupService.getGroupById(groupId);
      setGroup(data);
    } catch (err) {
      setError(err.message || 'Failed to load group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceFormChange = (field) => (event) => {
    setResourceFormError('');
    setResourceForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleResourceTypeChange = (event) => {
    const nextType = event.target.value;
    setResourceFormError('');
    setResourceForm((previous) => ({
      ...previous,
      type: nextType,
      externalUrl: nextType === 'LINK' ? previous.externalUrl : '',
    }));
    if (nextType === 'LINK') {
      setResourceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResourceFileChange = (event) => {
    setResourceFormError('');
    const file = event.target.files?.[0];
    if (!file) {
      setResourceFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setResourceFormError('File size must be 10MB or less.');
      setResourceFile(null);
      event.target.value = '';
      return;
    }
    setResourceFile(file);
    if (resourceForm.type === 'LINK') {
      setResourceForm((previous) => ({ ...previous, type: 'DOCUMENT' }));
    }
  };

  const handleResourceSubmit = async (event) => {
    event.preventDefault();
    setResourceFormError('');

    if (!resourceForm.title.trim()) return setResourceFormError('Title is required.');
    const hasFile = Boolean(resourceFile);
    const hasExternalUrl = Boolean(resourceForm.externalUrl.trim());
    if (hasFile === hasExternalUrl) return setResourceFormError('Provide either a file or an external URL.');
    if (resourceForm.type === 'LINK' && !hasExternalUrl) return setResourceFormError('Type LINK requires an external URL.');
    if (hasFile && resourceForm.type === 'LINK') return setResourceFormError('Type LINK does not allow file uploads.');

    setIsResourceSubmitting(true);
    try {
      const tags = resourceForm.tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
      await resourceHubService.createResource({
        ...resourceForm,
        title: resourceForm.title.trim(),
        description: resourceForm.description.trim(),
        externalUrl: resourceForm.externalUrl.trim(),
        file: resourceFile,
        tags,
        groupId
      });
      setResourceForm(initialResourceForm);
      setResourceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsResourceModalOpen(false);
      loadFeeds();
    } catch (error) {
      setResourceFormError(error.message || 'Error creating resource');
    } finally {
      setIsResourceSubmitting(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await groupService.joinGroup(groupId);
      await loadGroup();
      await loadFeeds();
    } catch (err) {
      setActionError(err.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setActionLoading(true);
    setActionError('');
    try {
      await groupService.leaveGroup(groupId);
      await loadGroup();
      setFeedItems([]);
    } catch (err) {
      setActionError(err.message || 'Failed to leave group');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostCreated = () => {
    setIsPostModalOpen(false);
    loadFeeds();
  };

  const handleResourceDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    deleteTargetRef.current = id;
    try {
      await resourceHubService.deleteResource(id);
      loadFeeds();
    } catch (error) {
      alert(error.message || 'Failed to delete resource');
    } finally {
      deleteTargetRef.current = null;
    }
  };

  const handlePostDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    deleteTargetRef.current = id;
    try {
      await postService.deletePost(id);
      loadFeeds();
    } catch (error) {
      alert(error.message || 'Failed to delete post');
    } finally {
      deleteTargetRef.current = null;
    }
  };

  const handleReact = async (postId, reactionType) => {
    try {
      const summary = await postService.reactToPost(postId, reactionType);
      
      setFeedItems(prevItems => prevItems.map(p => {
        if (p.id === postId && p.feedType === 'post') {
          return { ...p, reactionCounts: summary.reactionCounts, totalReactions: summary.totalReactions, currentUserReaction: summary.currentUserReaction };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to react to post:', err);
    }
  };

  const handleToggleComments = async (postId) => {
    const isExpanded = expandedComments.has(postId);
    const newExpanded = new Set(expandedComments);

    if (isExpanded) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
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
      
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      setShowCommentEmojiPicker(null);

      // Increment comment count in feeds state
      setFeedItems(prevItems => prevItems.map(post => {
        if (post.id === postId && post.feedType === 'post') {
          return { ...post, commentCount: (post.commentCount || 0) + 1 };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await postService.deleteComment(commentId);
      
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));

      // Decrement comment count
      setFeedItems(prevItems => prevItems.map(post => {
        if (post.id === postId && post.feedType === 'post') {
          return { ...post, commentCount: Math.max(0, (post.commentCount || 0) - 1) };
        }
        return post;
      }));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const prettyLabel = (label) => label.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  const normalizeRoleLabel = (role) => {
    if (!role) return 'Student';
    return role.toLowerCase().replace('role_', '').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderPostContent = (postContent) => {
    let resourceData = null;

    if (postContent?.startsWith('[RES_SHARE]')) {
      try {
        resourceData = JSON.parse(postContent.replace('[RES_SHARE]', ''));
      } catch (e) {
        console.error('Failed to parse shared resource:', e);
      }
    } else if (postContent?.startsWith('Shared a resource:')) {
      // Backwards compatibility for older share texts
      const lines = postContent.split('\n\n');
      const titleLine = lines[0]?.replace('Shared a resource: ', '').replace(/"/g, '') || 'Unknown Title';
      const linkLine = lines[1] || ''; 
      
      const isFile = linkLine.startsWith('File: ');
      const url = isFile ? linkLine.replace('File: ', '') : linkLine.replace('Link: ', '');
      
      resourceData = {
          id: `legacy-${Date.now()}`,
          title: titleLine,
          fileUrl: isFile ? url : null,
          externalUrl: !isFile ? url : null,
          category: 'LEGACY_SHARE',
          type: isFile ? 'DOCUMENT' : 'LINK',
          uploadedBy: { username: 'Shared' },
          createdAt: new Date().toISOString()
      };
    }

    if (resourceData) {
        return (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
             <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
               <Share2 className="w-3 h-3" />
               Shared Academic Resource
             </p>
             <ResourceCard
                resource={resourceData}
                user={user}
                deleteTarget={null}
                onDelete={() => {}} 
                prettyLabel={(l) => l.replace(/_/g, ' ')}
                normalizeRoleLabel={normalizeRoleLabel}
                formatDate={formatDate}
                onShare={() => handleShareClick(null, { ...resourceData, feedType: 'resource' })}
             />
          </div>
        );
    }
    
    return <p className="text-gray-800 text-sm whitespace-pre-wrap font-dm-sans mb-3">{postContent}</p>;
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium font-dm-sans">Loading group...</p>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 font-manrope">Group not found</h3>
        <p className="text-gray-500 mb-6 font-dm-sans">{error || 'The group you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate('/groups')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  const config = GROUP_TYPE_CONFIG[group.groupType] || GROUP_TYPE_CONFIG.COURSE;
  const Icon = config.icon;
  const isMember = !!group.currentUserRole;
  const isOwner = group.currentUserRole === 'OWNER';
  const isAdmin = group.currentUserRole === 'ADMIN';
  const canEdit = isOwner || isAdmin;
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const serverUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const coverBgUrl = group.coverPictureUrl ? resolveImageUrl(group.coverPictureUrl) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/groups')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover image or gradient banner */}
        <div
          className={`h-32 relative ${!coverBgUrl ? `bg-gradient-to-r ${config.color}` : ''}`}
          style={
            coverBgUrl
              ? {
                  backgroundImage: `url(${coverBgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute -bottom-8 left-6">
            <div className={`w-16 h-16 rounded-2xl ${config.bg} ${config.border} border-2 shadow-lg flex items-center justify-center overflow-hidden bg-white`}>
              {group.profilePictureUrl ? (
                <img src={resolveImageUrl(group.profilePictureUrl)} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <Icon className={`w-8 h-8 ${config.text}`} />
              )}
            </div>
          </div>
        </div>

        <div className="pt-12 pb-6 px-6">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 font-manrope">{group.name}</h1>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                  {config.label}
                </span>
              </div>
              {group.description && (
                <p className="text-sm text-gray-500 mt-2 font-dm-sans leading-relaxed">{group.description}</p>
              )}
            </div>

            {/* Join / Leave Button */}
            <div className="flex-shrink-0">
              {isMember ? (
                isOwner ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                      <Crown className="w-4 h-4" />
                      Owner
                    </span>
                    <button
                      onClick={() => navigate('/messages', { state: { selectedGroupId: groupId } })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                    <button
                      onClick={() => navigate(`/groups/${groupId}/edit`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/messages', { state: { selectedGroupId: groupId } })}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                    <button
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1">
                            <LogOut className="w-4 h-4" />
                            Leave
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Join Group
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Error */}
          {actionError && (
            <div className="mt-3 bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
              {actionError}
            </div>
          )}

          {/* Meta + Stats Row */}
          <div className="mt-5 flex items-center gap-4 flex-wrap text-sm text-gray-500">
            <button
              onClick={() => setShowMembers(true)}
              className="inline-flex items-center gap-1.5 hover:text-blue-600 transition font-medium"
            >
              <Users className="w-4 h-4" />
              <span className="font-semibold text-gray-900">{group.memberCount}</span>
              member{group.memberCount !== 1 ? 's' : ''}
            </button>

            {group.subject && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {group.subject}
              </span>
            )}

            {group.academicLevel && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {group.academicLevel}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Created {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Group Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Creator Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Created by
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
              {group.creatorProfileImageUrl ? (
                <img src={resolveImageUrl(group.creatorProfileImageUrl)} alt={group.creatorUsername} className="w-full h-full object-cover" />
              ) : (
                group.creatorUsername?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">@{group.creatorUsername}</p>
              <p className="text-xs text-gray-400">Group Owner</p>
            </div>
          </div>
        </div>

        {/* Visibility Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Group Info</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Visibility</span>
              <span className="font-medium text-gray-900 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs">{group.visibility}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Type</span>
              <span className={`font-medium px-2 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>{config.label}</span>
            </div>
            {group.currentUserRole && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Your Role</span>
                <span className="font-semibold text-gray-900">{group.currentUserRole}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Post & Resource Discussion Feed */}
      {isMember && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 font-manrope">Group Discussion</h3>
              <p className="text-sm text-gray-500 font-dm-sans">Share ideas and resources.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition whitespace-nowrap text-sm"
              >
                Create Post
              </button>
              <button
                onClick={() => setIsResourceModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition whitespace-nowrap text-sm"
              >
                Upload Resource
              </button>
            </div>
          </div>

          {feedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : feedItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-manrope mb-1">No discussions yet</h3>
              <p className="text-sm text-gray-500 font-dm-sans mb-4">Start the conversation by posting something new!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map(item => {
                if (item.feedType === 'post') {
                  const isPostOwner = user?.id && item.author?.id === user.id;
                  return (
                    <article key={`post-${item.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 transition-colors hover:border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 overflow-hidden">
                             {item.author?.imageUrl ? (
                               <img src={resolveImageUrl(item.author.imageUrl)} alt="" className="w-full h-full object-cover" />
                             ) : (
                               item.author?.initials || item.author?.username?.[0]?.toUpperCase() || 'U'
                             )}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900 text-sm">{item.author?.name || item.author?.username}</p>
                             <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                           </div>
                        </div>
                        
                        {isPostOwner && (
                          <div className="relative group/menu">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
                              <div className="bg-white border border-gray-100 shadow-xl rounded-xl min-w-[140px] overflow-hidden">
                                <button
                                  onClick={() => handlePostDelete(item.id)}
                                  disabled={deleteTargetRef.current === item.id}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                >
                                  {deleteTargetRef.current === item.id ? '...' : (
                                    <>
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        {renderPostContent(item.content)}
                      </div>
                      
                      {item.imageUrl && (
                        <div className="mt-3 mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                           <img src={resolveImageUrl(item.imageUrl)} alt="Post attachment" className="w-full h-auto max-h-[400px] object-contain" />
                        </div>
                      )}

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 text-[13px] text-gray-500 pb-3 mb-3 border-b border-gray-50 font-medium">
                        {item.totalReactions > 0 ? (
                          <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
                            <span className="text-base">👍</span> {item.totalReactions}
                          </span>
                        ) : (
                          <span className="hover:text-blue-600 cursor-pointer">0 reactions</span>
                        )}
                        <span className="hover:text-blue-600 cursor-pointer" onClick={() => handleToggleComments(item.id)}>{item.commentCount || 0} comments</span>
                        <span className="hover:text-blue-600 cursor-pointer">0 shares</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 h-11" onClick={(e) => e.stopPropagation()}>
                        <ReactionButton 
                          currentUserReaction={item.currentUserReaction} 
                          onReact={(reactionType) => handleReact(item.id, reactionType)} 
                        />
                        <button onClick={() => handleToggleComments(item.id)} className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn">
                          <MessageCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Comment</span>
                        </button>
                        <button 
                          onClick={(e) => handleShareClick(e, item)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group/btn"
                        >
                          <Share2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-sm font-bold">Share</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.has(item.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {user?.initials || user?.fullName?.[0] || user?.username?.[0] || 'U'}
                            </div>
                            <div className="flex-1 flex gap-2 items-center relative">
                              <div className="flex-1 relative flex items-center">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentInputs[item.id] || ''}
                                  onChange={(e) => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(item.id)}
                                  className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 pr-10 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowCommentEmojiPicker(showCommentEmojiPicker === item.id ? null : item.id)}
                                  className="absolute right-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                  title="Add emoji"
                                >
                                  <Smile className="w-5 h-5" />
                                </button>
                                {showCommentEmojiPicker === item.id && (
                                  <div className="absolute bottom-full right-0 mb-2 shadow-xl rounded-lg z-[60]" onMouseLeave={() => setShowCommentEmojiPicker(null)}>
                                    <EmojiPicker
                                      onEmojiClick={(emojiObject) => {
                                        setCommentInputs(prev => ({ ...prev, [item.id]: (prev[item.id] || '') + emojiObject.emoji }));
                                      }}
                                      autoFocusSearch={false}
                                      width={300}
                                      height={400}
                                    />
                                  </div>
                                )}
                              </div>
                              <button onClick={() => handleSubmitComment(item.id)} disabled={!commentInputs[item.id]?.trim() || isSubmittingComment[item.id]} className="text-blue-600 font-bold text-sm px-2 disabled:opacity-50 hover:text-blue-700 transition-colors">
                                {isSubmittingComment[item.id] ? '...' : 'Post'}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {commentsByPost[item.id]?.length === 0 ? (
                              <p className="text-center text-gray-400 text-xs py-2">No comments yet. Be the first to comment!</p>
                            ) : (
                              commentsByPost[item.id]?.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group/comment">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                                    {comment.authorImageUrl ? (
                                      <img src={resolveImageUrl(comment.authorImageUrl)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                    ) : (
                                      comment.authorName?.[0] || 'U'
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-2xl px-4 py-2 relative">
                                      <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <span className="text-xs font-bold text-gray-900">{comment.authorName || 'Unknown User'}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{formatDate(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed font-dm-sans">{comment.content}</p>

                                      {(user?.username === comment.authorUsername || user?.role === 'ADMIN') && (
                                        <button onClick={() => handleDeleteComment(comment.id, item.id)} className="absolute -right-2 -top-2 p-1.5 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all hover:scale-110">
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
                    </article>
                  );
                } else if (item.feedType === 'resource') {
                  return (
                    <div key={`resource-${item.id}`} className="h-full">
                       <ResourceCard
                         resource={item}
                         user={user}
                         deleteTarget={deleteTargetRef.current}
                         onDelete={handleResourceDelete}
                         prettyLabel={prettyLabel}
                         normalizeRoleLabel={normalizeRoleLabel}
                         formatDate={formatDate}
                       />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCompleted={handlePostCreated}
        groupId={group?.id}
      />

      {/* Resource Upload Modal */}
      <ResourceUploadModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        form={resourceForm}
        selectedFile={resourceFile}
        fileInputRef={fileInputRef}
        isSubmitting={isResourceSubmitting}
        formError={resourceFormError}
        onSubmit={handleResourceSubmit}
        onFormChange={handleResourceFormChange}
        onTypeChange={handleResourceTypeChange}
        onFileChange={handleResourceFileChange}
        categories={['STEM', 'BUSINESS', 'ARTS', 'SOCIAL_SCIENCE', 'TECHNOLOGY', 'LANGUAGE', 'HEALTH', 'EDUCATION']}
        types={['DOCUMENT', 'LINK', 'IMAGE', 'PRESENTATION']}
        prettyLabel={prettyLabel}
      />

      {/* Members Modal */}
      <GroupMembersModal
        groupId={group.id}
        groupName={group.name}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        content={shareContent}
        contentType={shareContent?.feedType === 'resource' ? 'RESOURCE' : 'POST'}
      />
    </div>
  );
};

export default GroupDetails;
