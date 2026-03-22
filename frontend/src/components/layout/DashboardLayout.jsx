import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import TopNavbar from '../navbar/TopNavbar';
import RightSidebar from '../sidebar/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';
import CreatePostModal from '../CreatePostModal';
import Toast from '../toasts/Toast';

const DashboardLayout = () => {
  const { loading, error, user, getUserInitials, getAvatarUrl } = useAuth();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
    <div className="flex bg-gray-50 overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNavbar />

        {/* Content + Right Sidebar Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Content - Scrollable */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6">
              {/* Create Post Prompt */}
              <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm p-4 md:p-6 mb-8 border border-gray-100 flex gap-4 items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt={user?.fullName}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-sm">
                      {getUserInitials?.()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-full py-3 px-4 text-sm md:text-base text-left transition-colors font-medium border-dashed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                >
                  Share an academic update, ask a question, or start a discussion...
                </button>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="hidden sm:flex px-4 py-2 bg-blue-600 text-white rounded-full font-medium shadow-sm transition-colors items-center gap-2 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  <span className="text-sm">Post</span>
                </button>
              </div>

              <Outlet />
            </div>
          </main>

          {/* Right Sidebar - Fixed width on desktop, hidden on tablet/mobile */}
          <RightSidebar />
        </div>
      </div>

      {/* Modals & Toasts */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCompleted={showToast}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
