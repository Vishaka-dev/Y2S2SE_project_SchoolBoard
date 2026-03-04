import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Calendar, Mail, Edit, Users, BookOpen, Award, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, getUserInitials, getRoleDisplay } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const getRoleBadgeColor = () => {
    switch (user.role?.toUpperCase()) {
      case 'TEACHER':
        return 'bg-purple-100 text-purple-700';
      case 'STUDENT':
        return 'bg-blue-100 text-blue-700';
      case 'INSTITUTE':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEducationLevelDisplay = () => {
    if (!user.educationLevel) return null;
    const levels = {
      HIGH_SCHOOL: 'High School',
      UNDERGRADUATE: 'Undergraduate',
      POSTGRADUATE: 'Postgraduate',
      DOCTORATE: 'Doctorate'
    };
    return levels[user.educationLevel] || user.educationLevel;
  };

  // Mock data - Replace with real data from backend
  const connections = 156;
  const posts = 23;
  const courses = user.role === 'STUDENT' ? 5 : user.role === 'TEACHER' ? 3 : 0;

  return (
    <div className="space-y-6">
      {/* Cover Image + Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-8 pb-6">
          {/* Profile Picture */}
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-xl">
              {user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.fullName} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{getUserInitials()}</span>
              )}
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => navigate('/account/edit-profile')}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>

          {/* Name and Role */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.fullName || 'User'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                {getRoleDisplay()}
              </span>
              {user.role === 'STUDENT' && user.educationLevel && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  {getEducationLevelDisplay()}
                </span>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-6 text-gray-600 text-sm mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{connections}</p>
              <p className="text-sm text-gray-500">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{posts}</p>
              <p className="text-sm text-gray-500">Posts</p>
            </div>
            {courses > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{courses}</p>
                <p className="text-sm text-gray-500">{user.role === 'STUDENT' ? 'Courses' : 'Teaching'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              About
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {user.bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
            </p>
          </div>

          {/* Education Section (for Students) */}
          {user.role === 'STUDENT' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Education
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getEducationLevelDisplay() || 'Education Level'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {user.institution || 'Institution not specified'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user.fieldOfStudy || 'Field of study not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skills/Interests Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              {user.role === 'STUDENT' ? 'Skills & Interests' : 'Expertise'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
                user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm text-center py-8">
                No recent activity to display.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Connections Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Connections
              </h2>
              <span className="text-sm text-gray-500">{connections}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-full aspect-square bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all connections →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition text-left">
                Share Profile
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-left">
                Download Resume
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition text-left">
                View Certificates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
