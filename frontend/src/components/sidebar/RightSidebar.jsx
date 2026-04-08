import { useState } from 'react';
import { Users, Calendar as CalendarIcon, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';

const RightSidebar = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

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
