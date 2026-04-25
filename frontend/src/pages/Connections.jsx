import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFollowers, getFollowing, getFollowStats } from '../services/followService';
import { getSuggestedConnections } from '../services/suggestionService';
import UserCard from '../components/UserCard';

const Connections = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const initialTab = searchParams.get('tab') || 'followers';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  
  const [followersPage, setFollowersPage] = useState(0);
  const [followingPage, setFollowingPage] = useState(0);
  
  const [followersHasNext, setFollowersHasNext] = useState(false);
  const [followingHasNext, setFollowingHasNext] = useState(false);
  
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const fetchStats = async () => {
    if (!user?.id) return;
    const response = await getFollowStats(user.id);
    setFollowersCount(response.data?.followersCount || 0);
    setFollowingCount(response.data?.followingCount || 0);
  };

  const fetchFollowers = async (page = 0, append = false) => {
    if (!user?.id) return;
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
    if (!user?.id) return;
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

  const fetchSuggestions = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getSuggestedConnections(30);
      setSuggestions(data?.suggestions || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    fetchStats();
    fetchFollowers(0, false);
    fetchFollowing(0, false);
    fetchSuggestions();
  }, [user?.id]);

  const getActiveUsers = () => {
    if (activeTab === 'followers') return followers;
    if (activeTab === 'following') return following;
    return suggestions;
  };
  
  const activeUsers = getActiveUsers();
  
  const getActiveHasNext = () => {
    if (activeTab === 'followers') return followersHasNext;
    if (activeTab === 'following') return followingHasNext;
    return false; // Suggestions don't have pagination yet
  };
  
  const activeHasNext = getActiveHasNext();
  const activePage = activeTab === 'followers' ? followersPage : followingPage;

  const handleLoadMore = () => {
    if (activeTab === 'followers') fetchFollowers(activePage + 1, true);
    else if (activeTab === 'following') fetchFollowing(activePage + 1, true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <div className="mt-5 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => handleTabChange('followers')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'followers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Followers ({followersCount})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('following')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'following' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Following ({followingCount})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('suggestions')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition whitespace-nowrap ${
              activeTab === 'suggestions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
          >
            Suggestions
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
              {activeTab === 'followers' ? 'No followers yet' : activeTab === 'following' ? 'Not following anyone yet' : 'No suggestions found'}
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
