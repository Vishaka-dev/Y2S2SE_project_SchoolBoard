import { useAuth } from '../context/AuthContext';
import FollowButton from './FollowButton';

const UserCard = ({
  user,
  showFollowButton = true,
  onFollowChange,
  onClick,
}) => {
  const { user: currentUser } = useAuth();

  if (!user) {
    return null;
  }

  const isCurrentUser = currentUser?.id === user.id;
  const canShowFollowButton = showFollowButton && !isCurrentUser;
  const initials = (user.displayName || user.username || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-4 shadow-sm transition ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-100' : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.displayName || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm">{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.displayName || user.username}
            </p>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </div>

        {canShowFollowButton && (
          <div onClick={(event) => event.stopPropagation()}>
            <FollowButton
              targetUserId={user.id}
              size="sm"
              onFollowChange={onFollowChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
