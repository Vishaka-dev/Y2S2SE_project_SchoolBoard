import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CreatePostModal from '../components/CreatePostModal';

const Dashboard = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 font-dm-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 md:px-8">
            <h1 className="text-2xl md:text-3xl font-bold font-manrope text-gray-900 mb-6">Welcome to SchoolBoard</h1>

            {/* Create Post Prompt */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm p-4 md:p-6 mb-8 border border-gray-100 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                ME
              </div>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-full py-3 px-4 text-sm md:text-base text-left transition-colors font-medium border-dashed focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              >
                Share an academic update, ask a question, or start a discussion...
              </button>
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="hidden sm:flex px-4 py-2 bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Post
              </button>
            </div>

            <p className="text-gray-600">You have successfully logged in! This is your dashboard.</p>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CreatePostModal isOpen={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </div>
  );
};

export default Dashboard;
