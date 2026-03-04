import { Users, Calendar, TrendingUp, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RightSidebar = () => {
  const { user } = useAuth();

  // Mock data - Replace with real API calls in production
  const suggestedConnections = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      role: 'Mathematics Teacher',
      mutualConnections: 12,
      avatar: null
    },
    {
      id: 2,
      name: 'Alex Chen',
      role: 'Computer Science Student',
      mutualConnections: 8,
      avatar: null
    },
    {
      id: 3,
      name: 'Prof. James Brown',
      role: 'Physics Teacher',
      mutualConnections: 15,
      avatar: null
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Math Workshop',
      date: 'Mar 5',
      time: '2:00 PM'
    },
    {
      id: 2,
      title: 'Career Fair 2026',
      date: 'Mar 8',
      time: '10:00 AM'
    },
    {
      id: 3,
      title: 'Science Symposium',
      date: 'Mar 12',
      time: '9:00 AM'
    }
  ];

  const stats = {
    connections: 156,
    posts: 23,
    profileViews: 89
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="hidden xl:block w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Your Stats
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connections</span>
              <span className="text-sm font-semibold text-gray-900">{stats.connections}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Posts</span>
              <span className="text-sm font-semibold text-gray-900">{stats.posts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profile Views</span>
              <span className="text-sm font-semibold text-gray-900">{stats.profileViews}</span>
            </div>
          </div>
        </div>

        {/* Suggested Connections */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Suggested Connections
          </h3>
          <div className="space-y-4">
            {suggestedConnections.map((connection) => (
              <div key={connection.id} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {connection.avatar ? (
                    <img 
                      src={connection.avatar} 
                      alt={connection.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(connection.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {connection.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{connection.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {connection.mutualConnections} mutual connections
                  </p>
                </div>
                <button 
                  className="flex-shrink-0 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Connect"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all suggestions →
          </button>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600">
                    {event.date.split(' ')[0]}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {event.date.split(' ')[1]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View calendar →
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#" className="hover:text-blue-600 transition">About</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Help</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Terms</a>
          </div>
          <p className="pt-2">© 2026 LearnLink</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
