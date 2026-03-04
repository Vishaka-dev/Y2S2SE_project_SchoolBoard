import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto py-8 px-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LearnLink</h1>
            <p className="text-gray-600">You have successfully logged in! This is your dashboard.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
