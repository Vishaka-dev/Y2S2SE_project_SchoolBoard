import { Users, FileText, Eye, Layers, Building2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FeedLeftRail = () => {
  const { user, getAvatarUrl, getUserInitials } = useAuth();
  const navigate = useNavigate();

  const institutionName =
    user?.profile?.institutionName ||
    user?.profile?.schoolName ||
    user?.profile?.universityName ||
    'Institution not set';

  // Placeholder stats until dedicated analytics endpoints are wired.
  const stats = {
    connections: user?.followStats?.followingCount ?? 0,
    posts: user?.postCount ?? 0,
    views: user?.profileViews ?? 0,
  };

  return (
    <aside className="hidden xl:flex flex-col gap-6 h-full overflow-y-auto pr-1">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <button
          onClick={() => navigate('/profile')}
          className="w-full text-left"
          title="Go to profile"
        >
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold overflow-hidden">
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt={user?.fullName || user?.username || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <span>{getUserInitials?.()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user?.fullName || user?.username || 'User'}</p>
              <div className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{institutionName}</span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" />Connections</span>
            <span className="font-semibold text-gray-900">{stats.connections}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" />Posts</span>
            <span className="font-semibold text-gray-900">{stats.posts}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-600" />Views</span>
            <span className="font-semibold text-gray-900">{stats.views}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Groups
        </h3>
        <p className="text-sm text-gray-600 mb-4">Discover and join study communities from your institution.</p>
        <button
          type="button"
          className="w-full rounded-lg border border-dashed border-blue-200 text-blue-700 py-2 text-sm font-medium hover:bg-blue-50 transition"
        >
          Coming Soon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" />
          Profile Tip
        </h3>
        <p className="text-sm text-gray-600">Complete your profile details to get better connection and content suggestions.</p>
      </div>
    </aside>
  );
};

export default FeedLeftRail;
