import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar as CalendarIcon, UserPlus, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { getSuggestedConnections } from '../../services/suggestionService';
import FollowButton from '../FollowButton';

const RightSidebar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Suggested connections state
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState(null);

  const fetchSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const data = await getSuggestedConnections(3);
      setSuggestions(data);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestionError('Unable to load suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Handle follow/unfollow events to refresh suggestions if a user is followed
  useEffect(() => {
    const handleFollowChanged = (event) => {
      const { isFollowing, targetUserId } = event.detail;
      // If we followed someone in the suggestion list, we might want to refresh 
      // the list eventually because they should no longer be a suggestion.
      // For immediate UX, we can just remove them from the current list.
      if (isFollowing) {
        setSuggestions(prev => prev.filter(s => s.userId !== targetUserId));
      }
    };

    window.addEventListener('followChanged', handleFollowChanged);
    return () => window.removeEventListener('followChanged', handleFollowChanged);
  }, []);

  // Mock data - Keep for events until real service is available
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

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="hidden xl:block h-full overflow-y-auto">
      <div className="space-y-6">

        {/* Suggested Connections */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Suggested Connections
            </h3>
            <button 
              onClick={fetchSuggestions}
              title="Refresh suggestions"
              className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-blue-600"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSuggestions ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>

          <div className="space-y-5">
            {isLoadingSuggestions && suggestions.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Finding matches...</p>
              </div>
            ) : suggestionError ? (
              <div className="py-4 text-center">
                <p className="text-xs text-red-500 mb-2">{suggestionError}</p>
                <button 
                  onClick={fetchSuggestions}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((connection) => (
                <div key={connection.userId} className="flex items-start gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
                    {connection.profileImageUrl ? (
                      <img 
                        src={connection.profileImageUrl} 
                        alt={connection.displayName || connection.username}
                        className="w-full h-full rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      getInitials(connection.displayName || connection.username)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition">
                      {connection.displayName || connection.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate leading-tight">
                      {connection.role}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {connection.matchReason && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                          {connection.matchReason}
                        </span>
                      )}
                      {connection.mutualFollowingCount > 0 && (
                        <span className="text-[10px] text-gray-400">
                          • {connection.mutualFollowingCount} mutual
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <FollowButton 
                      targetUserId={connection.userId}
                      size="sm"
                      onFollowChange={(nextState) => {
                        if (nextState) {
                          // Allow some time for animation before removal
                          setTimeout(() => {
                            setSuggestions(prev => prev.filter(s => s.userId !== connection.userId));
                          }, 1000);
                        }
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p className="text-xs italic">No suggestions available at the moment.</p>
              </div>
            )}
          </div>
          
          {suggestions.length > 0 && (
            <button 
              onClick={() => window.location.href = '/people'}
              className="w-full mt-5 text-sm text-blue-600 hover:text-blue-700 font-medium border-t pt-3 border-gray-50 hover:bg-gray-50 rounded-b-xl transition"
            >
              View more people →
            </button>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
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
          
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
          >
            {showCalendar ? 'Hide calendar ↑' : 'View calendar →'}
          </button>

          {showCalendar && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-gray-900">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button 
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-8"></div>
                ))}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentDate.getMonth()];
                  const eventForDay = upcomingEvents.find(event => event.date === `${monthName} ${day}`);
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                  
                  return (
                    <div 
                      key={day} 
                      className={`
                        h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-full text-sm relative transition
                        ${eventForDay ? 'bg-blue-50 text-blue-700 font-semibold cursor-pointer hover:bg-blue-100' : 'text-gray-700 hover:bg-gray-50 cursor-pointer'}
                        ${isToday && !eventForDay ? 'ring-2 ring-blue-500' : ''}
                      `}
                      title={eventForDay ? eventForDay.title : undefined}
                    >
                      <span className="z-10">{day}</span>
                      {eventForDay && (
                        <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
