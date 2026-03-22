import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getFollowers, getFollowing } from '../services/followService';
import UserCard from './UserCard';

const FollowListModal = ({ isOpen, onClose, userId, mode, title }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPage = async (pageNumber, append = false) => {
    setIsLoading(true);
    try {
      const response =
        mode === 'followers'
          ? await getFollowers(userId, pageNumber, 20)
          : await getFollowing(userId, pageNumber, 20);

      const payload = response.data;
      setUsers((prev) => (append ? [...prev, ...(payload.users || [])] : payload.users || []));
      setHasNext(Boolean(payload.hasNext));
      setPage(payload.page ?? pageNumber);
    } catch (error) {
      setUsers([]);
      setHasNext(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchPage(0, false);
    }
  }, [isOpen, userId, mode]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const emptyMessage = mode === 'followers' ? 'No followers yet' : 'Not following anyone yet';

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          {isLoading && users.length === 0 ? (
            <>
              {[1, 2, 3].map((row) => (
                <div key={row} className="animate-pulse bg-gray-100 rounded-xl h-20" />
              ))}
            </>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">{emptyMessage}</p>
          ) : (
            users.map((user) => <UserCard key={user.id} user={user} showFollowButton={false} />)
          )}
        </div>

        {hasNext && (
          <div className="p-4 border-t border-gray-100">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => fetchPage(page + 1, true)}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowListModal;
