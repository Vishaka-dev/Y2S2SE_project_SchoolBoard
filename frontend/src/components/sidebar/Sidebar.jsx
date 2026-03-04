import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import learnlinkLogo from '../../../logos/learnlink_logo.png';

const Sidebar = () => {
  const location = useLocation();
  const { user, getUserInitials, getRoleDisplay } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'My Profile', icon: User, path: '/profile' },
    { name: 'Connections', icon: Users, path: '/connections' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Notifications', icon: Bell, path: '/notifications' },
    { name: 'Edit Profile', icon: Settings, path: '/account/edit-profile' },
  ];

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-center px-6 h-16 border-b border-gray-200">
        <img src={learnlinkLogo} alt="LearnLink" className="h-10 w-auto" />
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mini Profile Summary at Bottom */}
      {user && (
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              {/* Profile Picture or Initials */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.fullName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">{getUserInitials()}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.fullName || user.email}
                </p>
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full mt-1">
                  {getRoleDisplay()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col shadow-2xl">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;
