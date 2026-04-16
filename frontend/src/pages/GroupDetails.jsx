import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Globe2, Lock, Plus, UserMinus, Users } from 'lucide-react';
import groupService from '../services/groupService';
import GroupMembersModal from '../components/GroupMembersModal';

const formatGroupType = (groupType) =>
  groupType
    ?.split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ') || 'Group';

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [error, setError] = useState('');

  const loadGroup = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await groupService.getGroupById(id);
      setGroup(data);
    } catch (err) {
      setError(err.message || 'Failed to load group details.');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
  }, [id]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await groupService.joinGroup(id);
      await loadGroup();
    } catch (err) {
      setError(err.message || 'Failed to join group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    const confirmed = window.confirm('Leave this group?');
    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    try {
      await groupService.leaveGroup(id);
      await loadGroup();
    } catch (err) {
      setError(err.message || 'Failed to leave group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenMembers = async () => {
    setMembersOpen(true);
    setMembersLoading(true);

    try {
      const data = await groupService.getGroupMembers(id);
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load group members.');
      setMembersOpen(false);
    } finally {
      setMembersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[32px] bg-white p-12 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-gray-500">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="rounded-[32px] bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Group unavailable</h1>
        <p className="mt-3 text-sm text-gray-500">{error || 'We could not find that group.'}</p>
        <button
          type="button"
          onClick={() => navigate('/my-groups')}
          className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Back to My Groups
        </button>
      </div>
    );
  }

  const canLeave = group.joined && group.currentUserRole !== 'OWNER';

  return (
    <>
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-sm">
          <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900" />
          <div className="px-6 pb-8 md:px-8">
            <div className="-mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex min-w-0 items-end gap-4">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-lg">
                  {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.name} className="h-full w-full object-cover" />
                  ) : (
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{group.name}</h1>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                      {formatGroupType(group.groupType)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {group.subject} • {group.academicLevel}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {!group.joined ? (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Plus className="h-4 w-4" />
                    {actionLoading ? 'Joining...' : 'Join Group'}
                  </button>
                ) : canLeave ? (
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <UserMinus className="h-4 w-4" />
                    {actionLoading ? 'Leaving...' : 'Leave Group'}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                    {group.currentUserRole === 'OWNER' ? 'You own this group' : 'You are a member'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleOpenMembers}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <Users className="h-4 w-4 text-blue-600" />
                  View Members
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <section className="rounded-[28px] border border-gray-100 bg-gray-50 p-6">
                  <h2 className="text-base font-bold text-gray-900">About This Group</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                    {group.description || 'No description has been added yet.'}
                  </p>
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-[28px] border border-gray-100 bg-white p-5">
                  <h2 className="text-sm font-semibold text-gray-900">Group Info</h2>
                  <div className="mt-4 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between gap-3">
                      <span>Members</span>
                      <span className="font-semibold text-gray-900">{group.memberCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Visibility</span>
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                        {group.visibility === 'PRIVATE' ? (
                          <Lock className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Globe2 className="h-4 w-4 text-emerald-600" />
                        )}
                        {group.visibility}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Created</span>
                      <span className="font-semibold text-gray-900">{formatDate(group.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-gray-100 bg-white p-5">
                  <h2 className="text-sm font-semibold text-gray-900">Created By</h2>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
                      {group.creator?.profileImageUrl ? (
                        <img
                          src={group.creator.profileImageUrl}
                          alt={group.creator.displayName || group.creator.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>
                          {(group.creator?.displayName || group.creator?.username || 'U')
                            .split(' ')
                            .map((part) => part[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {group.creator?.displayName || group.creator?.username}
                      </p>
                      <p className="truncate text-xs text-gray-500">@{group.creator?.username}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      <GroupMembersModal
        isOpen={membersOpen}
        members={members}
        isLoading={membersLoading}
        onClose={() => setMembersOpen(false)}
      />
    </>
  );
};

export default GroupDetails;
