import { useState, useEffect } from 'react';
import { X, Users, Crown, Shield, User } from 'lucide-react';
import groupService from '../services/groupService';

const ROLE_CONFIG = {
  OWNER: { icon: Crown, label: 'Owner', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ADMIN: { icon: Shield, label: 'Admin', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  MEMBER: { icon: User, label: 'Member', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
};

const GroupMembersModal = ({ groupId, groupName, isOpen, onClose }) => {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && groupId) {
      fetchMembers();
    }
  }, [isOpen, groupId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await groupService.getGroupMembers(groupId);
      setMembers(data);
    } catch (err) {
      setError(err.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const sortedMembers = [...members].sort((a, b) => {
    const order = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
    return (order[a.role] ?? 3) - (order[b.role] ?? 3);
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-manrope">Members</h2>
              <p className="text-xs text-gray-500 font-dm-sans">{groupName} · {members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <button
                onClick={fetchMembers}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          ) : sortedMembers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No members found</p>
          ) : (
            <div className="space-y-2">
              {sortedMembers.map((member) => {
                const roleConf = ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER;
                const RoleIcon = roleConf.icon;
                const initials = (member.username || 'U')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt={member.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm">{initials}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {member.username}
                        </p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${roleConf.bg} ${roleConf.color} ${roleConf.border} border inline-flex items-center gap-1`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleConf.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
