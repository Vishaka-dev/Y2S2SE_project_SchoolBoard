import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Search, Users } from 'lucide-react';
import groupService from '../services/groupService';
import GroupCard from '../components/GroupCard';

const GROUP_CATEGORY_OPTIONS = [
  { value: 'COURSE', label: 'Course' },
  { value: 'BATCH', label: 'Batch' },
  { value: 'STUDY_GROUP', label: 'Study Group' },
  { value: 'PROJECT', label: 'Project' },
  { value: 'EXAM_PREP', label: 'Exam Prep' },
  { value: 'CLUB', label: 'Club' },
  { value: 'MENTORSHIP', label: 'Mentorship' },
];

const MyGroups = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true);
      setError('');

      try {
        if (selectedCategory) {
          const allGroupsData = await groupService.getGroupsByCategory(selectedCategory);
          setMyGroups(allGroupsData.filter((group) => group.joined));
          setDiscoverGroups(allGroupsData.filter((group) => !group.joined));
          return;
        }

        const [myGroupsData, allGroupsData] = await Promise.all([groupService.getMyGroups(), groupService.getGroups()]);

        setMyGroups(myGroupsData);
        setDiscoverGroups(allGroupsData.filter((group) => !group.joined));
      } catch (err) {
        setError(err.message || 'Failed to load groups.');
      } finally {
        setLoading(false);
      }
    };

    loadGroups();
  }, [selectedCategory]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const matchesSearch = (group) => {
    if (!normalizedSearch) return true;

    return [group.name, group.description, group.category]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  };

  const filteredMyGroups = myGroups.filter(matchesSearch);
  const filteredDiscoverGroups = discoverGroups.filter(matchesSearch);

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Groups</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">My Learning Communities</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              See the groups you already belong to and discover more spaces for collaboration, projects, and revision.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search groups..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="groupCategory" className="text-sm font-medium text-gray-700">
                  Filter by:
                </label>
                <select
                  id="groupCategory"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Categories</option>
                  {GROUP_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Clear
                  </button>
                )}
              </div>
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
        ) : filteredMyGroups.length === 0 ? (
          myGroups.length === 0 ? (
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
            <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
              No groups match your current search or filter.
            </div>
          )
        ) : (
          <div className="grid gap-4">
            {filteredMyGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Discover More Groups</h2>
        {loading ? null : filteredDiscoverGroups.length === 0 ? (
          <div className="rounded-[28px] border border-gray-100 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            {discoverGroups.length === 0
              ? 'You’re already in every visible group right now.'
              : 'No discoverable groups match your current search or filter.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDiscoverGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyGroups;
