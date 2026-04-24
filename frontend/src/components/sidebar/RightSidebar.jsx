import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar as CalendarIcon, Loader2, Clock, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSuggestedConnections } from '../../services/suggestionService';
import { eventService } from '../../services/eventService';
import FollowButton from '../FollowButton';

const RightSidebar = () => {
  const navigate = useNavigate();

  // Suggested connections state
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState(null);
  const [showAllSuggestionsModal, setShowAllSuggestionsModal] = useState(false);
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [isLoadingAllSuggestions, setIsLoadingAllSuggestions] = useState(false);

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

  const fetchAllSuggestions = useCallback(async () => {
    setIsLoadingAllSuggestions(true);
    try {
      const data = await getSuggestedConnections(100);
      setAllSuggestions(data?.suggestions || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to load all suggestions:', err);
      setAllSuggestions([]);
    } finally {
      setIsLoadingAllSuggestions(false);
    }
  }, []);

  const getSuggestionUserId = (suggestion) => suggestion?.userId ?? suggestion?.id;

  const handleOpenAllSuggestions = async () => {
    setShowAllSuggestionsModal(true);
    await fetchAllSuggestions();
  };

  const handleSuggestionClick = (connection) => {
    const userId = getSuggestionUserId(connection);
    if (!userId) return;
    navigate(`/profile/${userId}`);
  };

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
              suggestions.map((connection) => {
                const targetUserId = getSuggestionUserId(connection);
                return (
                <div
                  key={targetUserId || connection.username}
                  className="flex items-start gap-3 group cursor-pointer"
                  onClick={() => handleSuggestionClick(connection)}
                >
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
                    <div onClick={(event) => event.stopPropagation()}>
                    <FollowButton
                      targetUserId={targetUserId}
                      initialIsFollowing={Boolean(connection.isFollowing)}
                      size="sm"
                    />
                    </div>
                  </div>
                </div>
              )})
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p className="text-xs italic">No suggestions available at the moment.</p>
              </div>
            )}
          </div>
          
          {suggestions.length > 0 && (
            <button 
              onClick={handleOpenAllSuggestions}
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

      {showAllSuggestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">All Suggested Connections</h3>
              <button
                onClick={() => setShowAllSuggestionsModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-72px)] space-y-4">
              {isLoadingAllSuggestions ? (
                <div className="py-10 flex flex-col items-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-sm">Loading people...</p>
                </div>
              ) : allSuggestions.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  <p className="text-sm">No more suggested users right now.</p>
                </div>
              ) : (
                allSuggestions.map((connection) => {
                  const targetUserId = getSuggestionUserId(connection);
                  return (
                    <div
                      key={targetUserId || connection.username}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSuggestionClick(connection)}
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm">
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
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {connection.displayName || connection.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{connection.role}</p>
                        {connection.matchReason && (
                          <span className="inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                            {connection.matchReason}
                          </span>
                        )}
                      </div>

                      <div onClick={(event) => event.stopPropagation()}>
                        <FollowButton
                          targetUserId={targetUserId}
                          initialIsFollowing={Boolean(connection.isFollowing)}
                          size="sm"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
      </div>
  );
};

export default RightSidebar;
