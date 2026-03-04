import { Users, UserPlus, Search } from 'lucide-react';

const Connections = () => {
  // Mock data - Replace with API calls
  const connections = [
    { id: 1, name: 'Dr. Sarah Wilson', role: 'Mathematics Teacher', avatar: null, connected: true },
    { id: 2, name: 'Alex Chen', role: 'Computer Science Student', avatar: null, connected: true },
    { id: 3, name: 'Prof. James Brown', role: 'Physics Teacher', avatar: null, connected: true },
    { id: 4, name: 'Emily Davis', role: 'Chemistry Student', avatar: null, connected: true },
  ];

  const suggestions = [
    { id: 5, name: 'Michael Johnson', role: 'Biology Teacher', avatar: null, mutualConnections: 8 },
    { id: 6, name: 'Lisa Anderson', role: 'English Teacher', avatar: null, mutualConnections: 12 },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
            <p className="text-gray-600 text-sm mt-1">{connections.length} connections</p>
          </div>
          <div className="relative flex-1 max-w-md ml-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search connections..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition"
            />
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          People you may know
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((person) => (
            <div key={person.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-500 transition">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(person.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                <p className="text-sm text-gray-600 truncate">{person.role}</p>
                <p className="text-xs text-gray-500 mt-1">{person.mutualConnections} mutual connections</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Connections List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Your Connections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((person) => (
            <div key={person.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-500 transition">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {person.avatar ? (
                  <img src={person.avatar} alt={person.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(person.name)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                <p className="text-sm text-gray-600 truncate">{person.role}</p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">
                Message
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
