import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFollowers, getFollowing, getFollowStats } from '../services/followService';
import UserCard from '../components/UserCard';

const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('followers');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersPage, setFollowersPage] = useState(0);
  const [followingPage, setFollowingPage] = useState(0);
  const [followersHasNext, setFollowersHasNext] = useState(false);
  const [followingHasNext, setFollowingHasNext] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!user?.id) {
      return;
    }
    const response = await getFollowStats(user.id);
    setFollowersCount(response.data?.followersCount || 0);
    setFollowingCount(response.data?.followingCount || 0);
  };

  const fetchFollowers = async (page = 0, append = false) => {
    if (!user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await getFollowers(user.id, page, 20);
      const data = response.data || {};
      setFollowers((prev) => (append ? [...prev, ...(data.users || [])] : data.users || []));
      setFollowersPage(data.page ?? page);
      setFollowersHasNext(Boolean(data.hasNext));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFollowing = async (page = 0, append = false) => {
    if (!user?.id) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await getFollowing(user.id, page, 20);
      const data = response.data || {};
      setFollowing((prev) => (append ? [...prev, ...(data.users || [])] : data.users || []));
      setFollowingPage(data.page ?? page);
      setFollowingHasNext(Boolean(data.hasNext));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    fetchStats();
    fetchFollowers(0, false);
    fetchFollowing(0, false);
  }, [user?.id]);

  const activeUsers = activeTab === 'followers' ? followers : following;
  const activeHasNext = activeTab === 'followers' ? followersHasNext : followingHasNext;
  const activePage = activeTab === 'followers' ? followersPage : followingPage;

  const handleLoadMore = () => {
    if (activeTab === 'followers') {
      fetchFollowers(activePage + 1, true);
    } else {
      fetchFollowing(activePage + 1, true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <div className="mt-5 border-b border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'followers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Followers ({followersCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'following' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Following ({followingCount})
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading && activeUsers.length === 0 ? (
            <>
              {[1, 2, 3].map((row) => (
                <div key={row} className="animate-pulse bg-gray-100 rounded-xl h-20" />
              ))}
            </>
          ) : activeUsers.length === 0 ? (
            <p className="text-sm text-gray-500 py-6">
              {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            activeUsers.map((item) => (
              <UserCard
                key={item.id}
                user={item}
                showFollowButton
                onClick={() => navigate(`/profile/${item.id}`)}
              />
            ))
          )}
        </div>

        {activeHasNext && (
          <div className="pt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
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

export default Connections;
