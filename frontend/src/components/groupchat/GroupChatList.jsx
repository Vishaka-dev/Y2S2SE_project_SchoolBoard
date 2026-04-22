import { Search, Plus, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

/**
 * GroupChatList Component
 * Displays a list of user's groups with search and quick actions
 */
const GroupChatList = ({ groups, selectedGroupId, onSelectGroup, onCreateGroup, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const serverUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  return (
    <div className="w-full md:w-80 flex flex-col h-full min-h-0 border-r border-gray-200 bg-white">
      {/* Header with Create Button */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="font-bold text-gray-900 text-lg">Chats</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-blue-600"
            title="Create new group"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Groups List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              {searchTerm ? 'No groups found' : 'No groups yet. Create one!'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                  selectedGroupId === group.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Group Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {group.groupProfilePictureUrl ? (
                    <img
                      src={resolveImageUrl(group.groupProfilePictureUrl)}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(group.name)}</span>
                  )}
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {group.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {group.unreadCount > 0 ? (
                      <span className="font-semibold text-blue-600">
                        {group.unreadCount} new message{group.unreadCount !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span>{group.memberCount || 0} members</span>
                    )}
                  </p>
                </div>

                {/* Unread Badge */}
                {group.unreadCount > 0 && (
                  <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {group.unreadCount > 9 ? '9+' : group.unreadCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-bold text-gray-900 mb-4">Create New Group</h3>
            <p className="text-sm text-gray-600 mb-4">
              Navigate to the Groups section or use the "+" button to create a new group.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

GroupChatList.propTypes = {
  groups: PropTypes.array.isRequired,
  selectedGroupId: PropTypes.number,
  onSelectGroup: PropTypes.func.isRequired,
  onCreateGroup: PropTypes.func,
  isLoading: PropTypes.bool
};

GroupChatList.defaultProps = {
  isLoading: false
};

export default GroupChatList;
