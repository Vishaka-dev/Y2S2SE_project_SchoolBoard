import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Calendar, Mail, Edit, Users, BookOpen, Award, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/navbar/TopNavbar';

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
  const renderStudentProfile = (profile) => (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Education Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Education Level</p>
            <p className="font-semibold text-gray-900">{profile?.educationLevel || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date of Birth</p>
            <p className="font-semibold text-gray-900">{profile?.dateOfBirth || 'Not specified'}</p>
          </div>

          {(profile?.educationLevel === 'SCHOOL' || profile?.schoolName) && (
            <>
              <div>
                <p className="text-gray-500 mb-1">School</p>
                <p className="font-semibold text-gray-900">{profile?.schoolName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Grade</p>
                <p className="font-semibold text-gray-900">{profile?.grade || 'Not specified'}</p>
              </div>
            </>
          )}

          {(profile?.educationLevel === 'UNIVERSITY' || profile?.universityName) && (
            <>
              <div className="md:col-span-2">
                <p className="text-gray-500 mb-1">University</p>
                <p className="font-semibold text-gray-900">{profile?.universityName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Degree Program</p>
                <p className="font-semibold text-gray-900">{profile?.degreeProgram || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Year of Study</p>
                <p className="font-semibold text-gray-900">{profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : 'Not specified'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Interests
        </h2>
        <div className="flex flex-wrap gap-2">
          {profile?.interests ? (
            profile.interests.split(',').map((interest, index) => (
              <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                {interest.trim()}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No interests added yet.</p>
          )}
        </div>
      </div>
    </>
  );

  const renderTeacherProfile = (profile) => (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Professional Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Institution</p>
            <p className="font-semibold text-gray-900">{profile?.institutionName || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Specialization</p>
            <p className="font-semibold text-gray-900">{profile?.subjectSpecialization || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Experience</p>
            <p className="font-semibold text-gray-900">{profile?.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Date of Birth</p>
            <p className="font-semibold text-gray-900">{profile?.dateOfBirth || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 mb-1">Qualifications</p>
            <p className="font-semibold text-gray-900 whitespace-pre-wrap">{profile?.qualifications || 'Not specified'}</p>
          </div>
        </div>
      </div>
    </>
  );

  const renderInstituteProfile = (profile) => (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Institution Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Type</p>
            <p className="font-semibold text-gray-900">{profile?.institutionType || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Registration Number</p>
            <p className="font-semibold text-gray-900">{profile?.registrationNumber || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Contact Person</p>
            <p className="font-semibold text-gray-900">{profile?.contactPerson || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Contact Number</p>
            <p className="font-semibold text-gray-900">{profile?.contactNumber || 'Not specified'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500 mb-1">Address</p>
            <p className="font-semibold text-gray-900">{profile?.address || 'Not specified'}</p>
          </div>
          {profile?.website && (
            <div className="md:col-span-2">
              <p className="text-gray-500 mb-1">Website</p>
              <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">
                {profile.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white to-gray-100 flex items-center justify-center text-blue-600 font-bold text-4xl border-4 border-white shadow-xl relative overflow-hidden">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {user.fullName || user.username}
              {user.role === 'INSTITUTE' && user.profile?.verified && (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor()}`}>
                {getRoleDisplay()}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                @{user.username}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-6 text-gray-600 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            {user.profile?.province && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{user.profile.province}{user.profile.district ? `, ${user.profile.district}` : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Role Specific Profile Data */}
        <div className="lg:col-span-2">
          {user.role === 'STUDENT' && renderStudentProfile(user.profile)}
          {user.role === 'TEACHER' && renderTeacherProfile(user.profile)}
          {user.role === 'INSTITUTE' && renderInstituteProfile(user.profile)}
        </div>

        {/* Right Column - Generic Actions/Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm font-medium text-gray-500">Posts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-sm font-medium text-gray-500">Connections</p>
              </div>
            </div>
          </div>

        </div>
      </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
