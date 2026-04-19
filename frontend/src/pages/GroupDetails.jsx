import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Crown, Loader2, LogIn, LogOut, Calendar, BookOpen, GraduationCap, Pencil, MessageSquare } from 'lucide-react';
import groupService from '../services/groupService';
import { GROUP_TYPE_CONFIG } from '../components/GroupCard';
import GroupMembersModal from '../components/GroupMembersModal';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

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

  const handleJoin = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await groupService.joinGroup(groupId);
      await loadGroup();
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
    } catch (err) {
      setActionError(err.message || 'Failed to leave group');
    } finally {
      setActionLoading(false);
    }
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
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
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

      {/* Group Posts Placeholder */}
      {isMember && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 font-manrope mb-1">Group Discussion</h3>
          <p className="text-sm text-gray-500 font-dm-sans">
            Group posts and discussions will be available here soon!
          </p>
        </div>
      )}

      {/* Members Modal */}
      <GroupMembersModal
        groupId={group.id}
        groupName={group.name}
        isOpen={showMembers}
        onClose={() => setShowMembers(false)}
      />
    </div>
  );
};

export default GroupDetails;
