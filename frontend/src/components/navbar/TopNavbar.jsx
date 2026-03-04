import { Search, Bell, MessageSquare, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import learnlinkLogo from '../../../logos/learnlink_logo-transparent.png';

const TopNavbar = () => {
  const { user, getUserInitials, getRoleDisplay, getAvatarUrl, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    navigate('/account/edit-profile');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-3 cursor-pointer select-none"
      >
        <img src={learnlinkLogo} alt="LearnLink" className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-gray-900 hidden sm:block">LearnLink</h1>
      </div>
      
      {/* Search Bar */}
      <div className="flex-1 flex justify-center px-4 sm:px-8">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for connections, courses, articles..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition"
          />
        </div>
      </div>

      {/* Right Side - Icons & Profile */}
      <div className="flex items-center gap-3 ml-6">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition group"
          title="Notifications"
        >
          <Bell className="h-5 w-5 group-hover:text-blue-600 transition" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="relative p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition group"
          title="Messages"
        >
          <MessageSquare className="h-5 w-5 group-hover:text-blue-600 transition" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-200"></div>

        {/* User Profile Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition group"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {user.fullName || 'User'}
                </p>
                <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition overflow-hidden">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user.fullName || user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-xs">{getUserInitials()}</span>
                )}
              </div>

              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                {/* User Info in Dropdown */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.fullName || user.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg mt-2">
                    {getRoleDisplay()}
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">👤</span>
                    <span className="font-medium">View Profile</span>
                  </button>

                  <button
                    onClick={handleSettingsClick}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <span className="text-lg">⚙️</span>
                    <span className="font-medium">Edit Profile</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-medium"
                  >
                    <span className="text-lg">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNavbar;
