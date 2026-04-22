import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, Loader2, Users } from 'lucide-react';
import groupService from '../services/groupService';
import GroupCard from '../components/GroupCard';

const MyGroups = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-groups');
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [myData, allData] = await Promise.all([
        groupService.getMyGroups(),
        groupService.getAllGroups(),
      ]);
      setMyGroups(myData);
      setAllGroups(allData);
    } catch (err) {
      setError(err.message || 'Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedGroups = activeTab === 'my-groups' ? myGroups : allGroups;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-manrope flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
              Groups
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-dm-sans ml-[52px]">
              Discover and join academic study communities
            </p>
          </div>
          <button
            onClick={() => navigate('/groups/create')}
            className="bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-5 border-b border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('my-groups')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'my-groups'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Groups ({myGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              activeTab === 'discover'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Discover ({allGroups.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium font-dm-sans">Loading groups...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={loadGroups}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Retry
          </button>
        </div>
      ) : displayedGroups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-manrope">
            {activeTab === 'my-groups' ? 'No groups yet' : 'No groups available'}
          </h3>
          <p className="text-gray-500 mb-6 font-dm-sans">
            {activeTab === 'my-groups'
              ? 'Create or join a group to start collaborating with your peers!'
              : 'Be the first to create a group for your community!'}
          </p>
          <button
            onClick={() => navigate('/groups/create')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;
