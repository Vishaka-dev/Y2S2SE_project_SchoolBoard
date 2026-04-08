import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Users } from 'lucide-react';
import groupService from '../services/groupService';
import GroupCard from '../components/GroupCard';

const MyGroups = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError('');

      try {
        const [myGroupsData, allGroupsData] = await Promise.all([
          groupService.getMyGroups(),
          groupService.getGroups(),
        ]);

        setMyGroups(myGroupsData);
        setDiscoverGroups(allGroupsData.filter((group) => !group.joined));
      } catch (err) {
        setError(err.message || 'Failed to load groups.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Groups</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">My Learning Communities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              See the groups you already belong to and discover more spaces for collaboration, projects, and revision.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/groups/create')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FolderPlus className="h-4 w-4" />
            Create Group
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Groups You Belong To</h2>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((row) => (
              <div key={row} className="h-36 animate-pulse rounded-[28px] bg-white" />
            ))}
          </div>
        ) : myGroups.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
            <h3 className="text-xl font-bold text-gray-900">No groups yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Start your first study community or join one from the discovery list below.
            </p>
            <button
              type="button"
              onClick={() => navigate('/groups/create')}
              className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {myGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Discover More Groups</h2>
        {loading ? null : discoverGroups.length === 0 ? (
          <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            You’re already in every visible group right now.
          </div>
        ) : (
          <div className="grid gap-4">
            {discoverGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyGroups;
