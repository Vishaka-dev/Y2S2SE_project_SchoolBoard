import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, MapPin, Tag, Plus, Filter, Search, Clock, ChevronRight, Trash2, X } from 'lucide-react';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import CreateEventModal from '../components/CreateEventModal';

const CATEGORY_COLORS = {
  ACADEMIC: 'bg-blue-100 text-blue-700 border-blue-200',
  SPORTS: 'bg-green-100 text-green-700 border-green-200',
  ARTS: 'bg-purple-100 text-purple-700 border-purple-200',
  CULTURAL: 'bg-orange-100 text-orange-700 border-orange-200',
  HOLIDAY: 'bg-red-100 text-red-700 border-red-200',
  MEETING: 'bg-gray-100 text-gray-700 border-gray-200',
  WORKSHOP: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  OTHER: 'bg-pink-100 text-pink-700 border-pink-200',
};

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    window.addEventListener('eventCreated', loadEvents);
    return () => window.removeEventListener('eventCreated', loadEvents);
  }, []);

  // Handle URL parameter for direct event selection
  useEffect(() => {
    const eventId = searchParams.get('id');
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id.toString() === eventId);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [searchParams, events]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'ALL' || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter) {
      const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
      matchesDate = eventDate === dateFilter;
    }
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <section className="bg-white rounded-lg shadow-md border border-gray-100 p-4 md:p-6 mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold font-manrope text-gray-900">Event Board</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 font-dm-sans max-w-2xl">
              Stay updated with the latest happenings in our community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Schedule Event
            </button>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="bg-white rounded-lg shadow-md border border-gray-100 p-4 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold font-manrope text-gray-900">Search & Filters</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by title or location</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or location"
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All categories</option>
              {Object.keys(CATEGORY_COLORS).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilter('ALL');
                setSearchTerm('');
                setDateFilter('');
              }}
              className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Events Board */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold font-dm-sans">Syncing events board...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2 font-manrope">No Events Found</h3>
          <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Either there are no upcoming events or no matches for your search and filter criteria.</p>
          <button 
            onClick={() => {setFilter('ALL'); setSearchTerm('');}}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredEvents.map(event => {
            const dateInfo = formatDate(event.eventDate);
            return (
              <div 
                key={event.id}
                className="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col"
              >
                {/* Banner Image */}
                <div className="h-32 w-full bg-gray-100 relative overflow-hidden">
                  {event.bannerImageUrl ? (
                    <img 
                      src={event.bannerImageUrl} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <Calendar className="w-12 h-12 text-blue-600/20" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-[7px] font-bold tracking-widest uppercase border ${CATEGORY_COLORS[event.category]}`}>
                    {event.category}
                  </div>
                  
                  {/* Date Overlay */}
                  <div className="absolute -bottom-4 right-3 w-14 h-16 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center border border-gray-50">
                    <span className="text-[8px] font-bold text-blue-600">{dateInfo.month}</span>
                    <span className="text-lg font-bold text-gray-900">{dateInfo.day}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 pt-8 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors font-manrope leading-tight">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600">
                        <Clock className="w-3 h-3" />
                      </div>
                      {dateInfo.time}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-blue-600">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-500 text-xs font-medium leading-tight mb-3 line-clamp-1">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold ring-1 ring-white">
                        {event.author?.name?.[0] || 'U'}
                      </div>
                      <span className="text-xs font-semibold text-gray-600 truncate">{event.author?.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {(user?.username === event.author?.username || user?.role === 'ADMIN') && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedEvent(event)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onEventCreated={(msg, type) => {
          // You could add a toast here if you have one
        }}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div 
            className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setSelectedEvent(null);
                setSearchParams({}, { replace: true });
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full transition-colors text-gray-900 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Image Section */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                {selectedEvent.bannerImageUrl ? (
                  <img 
                    src={selectedEvent.bannerImageUrl} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600/20">
                    <Calendar className="w-20 h-20" />
                  </div>
                )}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border shadow-sm ${CATEGORY_COLORS[selectedEvent.category]}`}>
                  {selectedEvent.category}
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-blue-600 font-black text-xs tracking-widest uppercase mb-2">
                    {formatDate(selectedEvent.eventDate).full}
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 font-manrope leading-tight">
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
                      <p className="text-sm font-bold text-gray-700">{formatDate(selectedEvent.eventDate).time}</p>
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

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Category</p>
                      <p className="text-sm font-bold text-gray-700">{selectedEvent.category}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">About Event</p>
                  <p className="text-sm text-gray-600 leading-relaxed font-dm-sans whitespace-pre-wrap">
                    {selectedEvent.description || "No additional description provided for this event."}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center gap-3 mt-auto">
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
        </div>
      )}
    </div>
  );
};

export default Events;
