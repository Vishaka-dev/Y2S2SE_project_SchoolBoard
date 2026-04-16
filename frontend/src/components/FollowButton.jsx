import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { followUser, unfollowUser } from '../services/followService';
import Toast from './toasts/Toast';

const FollowButton = ({
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'md',
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Sync internal state if the prop changes (e.g., when data loads asynchronously)
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-lg'
      : 'px-4 py-2 text-sm rounded-xl';

  const handleToggleFollow = async () => {
    if (isLoading) {
      return;
    }

    setError('');
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setIsLoading(true);

    try {
      if (nextState) {
        await followUser(targetUserId);
        setToast({ message: 'Followed successfully', type: 'success' });
      } else {
        await unfollowUser(targetUserId);
        setToast({ message: 'Unfollowed successfully', type: 'success' });
      }

      window.dispatchEvent(new CustomEvent('followChanged', { detail: { isFollowing: nextState, targetUserId } }));

      if (onFollowChange) {
        onFollowChange(nextState);
      }
    } catch (apiError) {
      setIsFollowing(!nextState);
      setError('Failed to update follow status. Please try again.');
      setToast({ message: 'Failed to update follow status', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleToggleFollow}
        disabled={isLoading}
        className={`group relative font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses} ${
          isFollowing
            ? 'bg-blue-600 text-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-blue-600'
            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : isFollowing ? (
          <>
            <span className="group-hover:hidden">Following</span>
            <span className="hidden group-hover:inline">Unfollow</span>
          </>
        ) : (
          'Follow'
        )}
      </button>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

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

export default FollowButton;
