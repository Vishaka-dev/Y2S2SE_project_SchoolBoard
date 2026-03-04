import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import TopNavbar from '../navbar/TopNavbar';
import RightSidebar from '../sidebar/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';

const DashboardLayout = () => {
  const { loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to Load Dashboard
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Sidebar - Fixed width on desktop, hidden on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavbar />

        {/* Content + Right Sidebar Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              <Outlet />
            </div>
          </main>

          {/* Right Sidebar - Fixed width on desktop, hidden on tablet/mobile */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
