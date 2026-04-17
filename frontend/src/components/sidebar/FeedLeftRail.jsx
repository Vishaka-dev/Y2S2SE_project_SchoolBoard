import { Users, FileText, Eye, Layers, Building2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getFollowStats } from '../../services/followService';
import postService from '../../services/postService';
import accountService from '../../services/accountService';

const FeedLeftRail = () => {
  const { user, getAvatarUrl, getUserInitials } = useAuth();
  const navigate = useNavigate();

  const institutionName =
    user?.profile?.institutionName ||
    user?.profile?.schoolName ||
    user?.profile?.universityName ||
    'Institution not set';

  const [connections, setConnections] = useState(user?.followStats?.followingCount || 0);
  const [posts, setPosts] = useState(user?.postCount || 0);
  const [views, setViews] = useState(user?.profileViews || 0);

  useEffect(() => {
    if (!user?.id || !user?.username) return;

    let isMounted = true;

    // Fetch initial stats
    getFollowStats(user.id)
      .then((res) => {
        if (isMounted) setConnections(res.data?.followingCount || 0);
      })
      .catch((err) => console.error('Failed to fetch follow stats for FeedLeftRail:', err));

    postService.getUserPosts(user.username)
      .then((res) => {
        if (isMounted) setPosts(res.length || 0);
      })
      .catch((err) => console.error('Failed to fetch user posts for FeedLeftRail:', err));

    accountService.getAccountDetails()
      .then((res) => {
        if (isMounted) setViews(res.profileViews || 0);
      })
      .catch((err) => console.error('Failed to fetch account details for views:', err));

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handlePostCreated = () => setPosts((prev) => prev + 1);
    const handleFollowChanged = (e) => {
      setConnections((prev) => (e.detail.isFollowing ? prev + 1 : Math.max(0, prev - 1)));
    };

    window.addEventListener('postCreated', handlePostCreated);
    window.addEventListener('followChanged', handleFollowChanged);

    return () => {
      window.removeEventListener('postCreated', handlePostCreated);
      window.removeEventListener('followChanged', handleFollowChanged);
    };
  }, []);

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
            <span className="font-semibold text-gray-900">{connections}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" />Posts</span>
            <span className="font-semibold text-gray-900">{posts}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-600" />Views</span>
            <span className="font-semibold text-gray-900">{views}</span>
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
          onClick={() => navigate('/groups')}
          className="w-full rounded-lg border border-blue-200 bg-blue-50 text-blue-700 py-2 text-sm font-medium hover:bg-blue-100 transition"
        >
          Browse Groups
        </button>
      </div>
    </aside>
  );
};

export default FeedLeftRail;
