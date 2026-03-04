import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Bookmark, Settings, GraduationCap } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Resources', icon: BookOpen, path: '/resources' },
    { name: 'Articles', icon: FileText, path: '/articles' },
    { name: 'Saved Items', icon: Bookmark, path: '/saved' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      {/* Logo Section */}
      <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">SchoolBoard</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings at Bottom */}
      <div className="px-3 py-1 border-t border-gray-200">
        <Link
          to="/account/edit-profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            isActive('/account/edit-profile')
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Edit Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
