import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, UserPlus, ChevronLeft, ChevronRight, Loader2, RefreshCw, Clock, MapPin, X } from 'lucide-react';
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
  const navigate = useNavigate();

  const fetchSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const data = await getSuggestedConnections(3);
      const suggestionsList = data?.suggestions || (Array.isArray(data) ? data : []);
      setSuggestions(suggestionsList.slice(0, 3));
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setSuggestionError('Unable to load suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchUpcomingEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    console.log('Fetching upcoming events...');
    try {
      const data = await eventService.getUpcomingEvents();
      console.log('Events received:', data);
      
      if (data && Array.isArray(data)) {
        const sortedData = [...data].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        setUpcomingEvents(sortedData);
      } else {
        console.warn('Received malformed event data:', data);
        setUpcomingEvents([]);
      }
    } catch (err) {
      console.error('Failed to load upcoming events:', err);
      setUpcomingEvents([]);
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
      if (isFollowing) {
        setSuggestions(prev => prev.filter(s => s.id !== targetUserId));
      }
    };

    window.addEventListener('followChanged', handleFollowChanged);
    return () => window.removeEventListener('followChanged', handleFollowChanged);
  }, []);

  const formatEventDate = (dateString) => {
    if (!dateString) return { month: 'N/A', day: '--', time: 'TBA', full: 'Date TBA' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { month: 'N/A', day: '--', time: 'TBA', full: 'Date TBA' };
    
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
    <div className="h-full flex flex-col pt-2 pb-6">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        
        {/* Suggested Connections */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
                <div key={connection.id} className="flex items-start gap-3 group animate-in opacity-100 fade-in slide-in-from-right-2 duration-500">
                  <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/profile/${connection.id}`)}
                  >
                    {connection.profileImageUrl ? (
                      <img 
                        src={connection.profileImageUrl} 
                        alt={connection.displayName || connection.username}
                        className="w-full h-full object-cover border border-gray-100"
                      />
                    ) : (
                      getInitials(connection.displayName || connection.username)
                    )}
                  </div>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${connection.id}`)}
                  >
                    <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition">
                      {connection.displayName || connection.username}
                    </p>
                    <p className="text-xs text-gray-500 truncate leading-tight">
                      {connection.role}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <FollowButton 
                      targetUserId={connection.id}
                      size="sm"
                      onFollowChange={(nextState) => {
                        if (nextState) {
                          setTimeout(() => {
                            setSuggestions(prev => prev.filter(s => s.id !== connection.id));
                          }, 1000);
                        }
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-gray-500">
                <p className="text-xs italic">No suggestions available.</p>
              </div>
            )}
          </div>
          
          {suggestions.length > 0 && (
            <button 
              onClick={() => navigate('/connections')}
              className="w-full mt-5 text-sm text-blue-600 hover:text-blue-700 font-medium border-t pt-3 border-gray-50 hover:bg-gray-50 rounded-b-xl transition"
            >
              View more people →
            </button>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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
              upcomingEvents.slice(0, 3).map((event) => {
                const { month, day, time } = formatEventDate(event.eventDate);
                return (
                  <div 
                    key={event.id} 
                    className="flex gap-3 group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition animate-in opacity-100 fade-in slide-in-from-right-2 duration-300 [animation-fill-mode:forwards]"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center border border-blue-100 group-hover:bg-blue-100 transition">
                      <span className="text-[10px] uppercase font-bold text-blue-600 leading-none mb-0.5">{month}</span>
                      <span className="text-lg font-black text-blue-700 leading-none">{day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition" title={event.title}>
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <p className="text-xs font-medium">{time}</p>
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

            {upcomingEvents.length > 3 && (
              <button 
                onClick={() => navigate('/events')}
                className="w-full mt-4 flex items-center justify-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition uppercase tracking-tighter"
              >
                See all events on board
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setShowCalendar(true)}
            className="w-full mt-5 text-xs text-blue-600 hover:text-blue-700 font-bold border-t pt-3 border-gray-50 transition uppercase tracking-wider"
          >
            View calendar →
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center text-[10px] text-gray-400 space-y-1 pb-10">
          <div className="flex flex-wrap justify-center gap-x-2">
            <a href="#" className="hover:text-blue-600 transition">About</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Help</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-blue-600 transition">Terms</a>
          </div>
          <p>© 2026 LearnLink</p>
        </div>
      </div>

      {/* Calendar Popup Modal */}
      {showCalendar && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowCalendar(false)}
        >
          <div 
            className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-50 relative flex items-center justify-center">
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} 
                className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-black text-gray-900">{currentDate.toLocaleString('default', { month: 'long' })}</h3>
                <p className="text-xs font-bold text-blue-600 tracking-widest">{currentDate.getFullYear()}</p>
              </div>
              
              <button 
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} 
                className="absolute right-16 md:right-20 p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowCalendar(false)} 
                className="absolute right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => ( <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{day}</div> ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => ( <div key={`pad-${i}`} className="h-9 w-9"></div> ))}
                {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                  const day = i + 1;
                  const eventForDay = upcomingEvents.find(event => {
                    const eDate = new Date(event.eventDate);
                    return eDate.getDate() === day && eDate.getMonth() === currentDate.getMonth() && eDate.getFullYear() === currentDate.getFullYear();
                  });
                  const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                  return (
                    <div 
                      key={day} 
                      onClick={() => eventForDay && setSelectedEvent(eventForDay)}
                      className={`h-9 w-9 mx-auto flex flex-col items-center justify-center rounded-2xl text-sm relative transition ${eventForDay ? 'bg-blue-600 text-white font-black cursor-pointer' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span>{day}</span>
                      {eventForDay && <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 shadow-sm"><X className="w-5 h-5" /></button>
            <div className="h-48 w-full bg-gray-100 relative">
              {selectedEvent.bannerImageUrl ? <img src={selectedEvent.bannerImageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-200"><CalendarIcon className="w-16 h-16" /></div>}
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">{selectedEvent.category || 'EVENT'}</div>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <div className="text-blue-600 font-black text-xs tracking-widest uppercase mb-2">{formatEventDate(selectedEvent.eventDate).full}</div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedEvent.title}</h2>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock className="w-5 h-5" /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase">Time</p><p className="text-sm font-bold text-gray-700">{formatEventDate(selectedEvent.eventDate).time}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><MapPin className="w-5 h-5" /></div>
                  <div><p className="text-[10px] font-black text-gray-400 uppercase">Location</p><p className="text-sm font-bold text-gray-700">{selectedEvent.location}</p></div>
                </div>
              </div>
              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed max-h-48 overflow-y-auto pr-2">{selectedEvent.description || "No description provided."}</p>
              </div>
              <div className="pt-6 border-t border-gray-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {selectedEvent.author?.profileImageUrl ? <img src={selectedEvent.author.profileImageUrl} alt="" className="w-full h-full rounded-full object-cover" /> : (selectedEvent.author?.name?.[0] || 'U')}
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Organized by</p>
                  <p className="text-sm font-bold text-gray-700">{selectedEvent.author?.name || "School Board"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
