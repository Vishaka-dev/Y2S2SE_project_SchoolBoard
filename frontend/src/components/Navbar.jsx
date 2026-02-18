import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // You can later get this from user context/state
  const user = {
    name: 'John Doe',
    role: 'Student',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff'
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition"
          />
        </div>
      </div>

      {/* Right Side - Notification & User Profile */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
          <Bell className="h-5 w-5" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="relative"
            title="Click to logout"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full ring-2 ring-gray-200 hover:ring-blue-500 transition cursor-pointer"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
