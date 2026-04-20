import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar as CalendarIcon, UserPlus, Loader2, Clock, RefreshCw } from 'lucide-react';
import { getSuggestedConnections } from '../../services/suggestionService';
import { eventService } from '../../services/eventService';
import FollowButton from '../FollowButton';

const RightSidebar = () => {
  // Suggested connections state
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState(null);

  // Upcoming events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const fetchSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const data = await getSuggestedConnections(3);
      setSuggestions(data?.suggestions || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestionError('Unable to load suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getUpcomingEvents();
      // Take only first 3
      setUpcomingEvents(data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    fetchEvents();
  }, [fetchSuggestions, fetchEvents]);

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

  const formatEventDate = (dateString) => {
    if (!dateString) return { month: 'N/A', day: '--' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { month: 'N/A', day: '--' };
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return { month, day };
  };

  const formatEventTime = (dateString) => {
    if (!dateString) return 'Time TBA';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Time TBA';
    return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
            {isLoadingEvents ? (
              <div className="py-6 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Loading events...</p>
              </div>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const dateToFormat = event.eventDate || event.startTime || event.date;
                const { month, day } = formatEventDate(dateToFormat);
                return (
                  <div key={event.id} className="flex gap-3 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-blue-600 leading-none mb-0.5">
                        {month}
                      </span>
                      <span className="text-lg font-black text-blue-700 leading-none">
                        {day}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors" title={event.title}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <p className="text-xs font-medium">{formatEventTime(dateToFormat)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-gray-400 font-medium">No upcoming events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
