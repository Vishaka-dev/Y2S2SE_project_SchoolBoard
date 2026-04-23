import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar as CalendarIcon, UserPlus, ChevronLeft, ChevronRight, Loader2, RefreshCw, Clock, MapPin, X, Calendar } from 'lucide-react';
import { getSuggestedConnections } from '../../services/suggestionService';
import { eventService } from '../../services/eventService';
import FollowButton from '../FollowButton';

const RightSidebar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Suggested connections state
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState(null);

  // Events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

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

  const fetchUpcomingEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getUpcomingEvents();
      setUpcomingEvents(data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
    } catch (err) {
      console.error('Failed to load upcoming events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
    fetchUpcomingEvents();
  }, [fetchSuggestions, fetchUpcomingEvents]);

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
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    };
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
              <div className="py-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.slice(0, 3).map((event) => {
                const { month, day, time } = formatEventDate(event.eventDate);
                return (
                  <div 
                    key={event.id} 
                    className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center group-hover:bg-blue-100 transition">
                      <span className="text-[10px] font-black text-blue-600 uppercase">
                        {month}
                      </span>
                      <span className="text-lg font-black text-blue-600 leading-none">
                        {day}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">
                        {event.title}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500">{time}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 italic text-center py-2">No upcoming events.</p>
            )}
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
                  const isToday = new Date().getDate() === day && 
                                  new Date().getMonth() === currentDate.getMonth() && 
                                  new Date().getFullYear() === currentDate.getFullYear();
                  
                  return (
                    <div 
                      key={day} 
                      className={`
                        h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-full text-sm relative transition cursor-pointer
                        ${isToday ? 'ring-2 ring-blue-500 font-bold text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                      `}
                    >
                      <span className="relative z-10">{day}</span>
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full transition-colors text-gray-900 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image Section */}
            <div className="h-48 w-full bg-gray-100 relative">
              {selectedEvent.bannerImageUrl ? (
                <img 
                  src={selectedEvent.bannerImageUrl} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600/20">
                  <Calendar className="w-16 h-16" />
                </div>
              )}
              {/* Category Badge overlay on image */}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-white/20 shadow-sm">
                {selectedEvent.category || 'EVENT'}
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="text-blue-600 font-black text-xs tracking-widest uppercase mb-2">
                  {formatEventDate(selectedEvent.eventDate).full}
                </div>
                <h2 className="text-2xl font-black text-gray-900 font-manrope leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Time</p>
                    <p className="text-sm font-bold text-gray-700">{formatEventDate(selectedEvent.eventDate).time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Location</p>
                    <p className="text-sm font-bold text-gray-700">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">Event Description</p>
                <p className="text-sm text-gray-600 leading-relaxed font-dm-sans whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                  {selectedEvent.description || "No additional description provided for this event."}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                  {selectedEvent.author?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Organized by</p>
                  <p className="text-sm font-bold text-gray-700">{selectedEvent.author?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
