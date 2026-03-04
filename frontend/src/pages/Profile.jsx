import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Calendar, Mail, Edit, Users, BookOpen, Award, Activity, MessageSquare, ThumbsUp, Share2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/navbar/TopNavbar';
import postService from '../services/postService';
import { useState, useEffect } from 'react';

const Profile = () => {
  const { user, getUserInitials, getRoleDisplay, getAvatarUrl, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    // Refresh user data on mount to get latest imageUrl
    refreshUser().catch(err => console.error("Failed to refresh user on profile load:", err));
  }, []);

  useEffect(() => {
    if (user?.username) {
      fetchUserPosts();
    }
  }, [user?.username]);

  const fetchUserPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await postService.getUserPosts(user.username);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

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
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-6 md:p-8">
            {/* Profile Info Section */}
            <div className="relative">
              {/* Profile Picture & Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-md relative z-10 flex-shrink-0 border-4 border-gray-50 flex items-center justify-center overflow-hidden">
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
                      <span className="text-3xl md:text-4xl text-blue-600 font-bold">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 font-manrope">
                      {user.fullName || user.username}
                      {user.role === 'INSTITUTE' && user.profile?.verified && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor()}`}>
                        {getRoleDisplay()}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        @{user.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => navigate('/account/edit-profile')}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-sm flex-shrink-0"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-6 text-gray-500 text-sm flex-wrap border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{user.email}</span>
                </div>
                {user.profile?.province && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{user.profile.province}{user.profile.district ? `, ${user.profile.district}` : ''}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Role Specific Profile Data & Posts */}
            <div className="lg:col-span-2 space-y-6">
              {user.role === 'STUDENT' && renderStudentProfile(user.profile)}
              {user.role === 'TEACHER' && renderTeacherProfile(user.profile)}
              {user.role === 'INSTITUTE' && renderInstituteProfile(user.profile)}

              {/* Recent Posts Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-manrope">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Recent Posts
                </h2>

                {isLoadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium font-dm-sans text-sm">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 shadow-sm">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-manrope">No posts yet</h3>
                    <p className="text-gray-500 text-sm font-dm-sans">Share your thoughts with the community!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-blue-600 font-bold border border-gray-100">
                            <img
                              src={getAvatarUrl()}
                              alt={user.fullName || user.username}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{user.fullName || user.username}</h4>
                            <p className="text-[11px] text-gray-500 font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        {post.content && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap font-dm-sans">{post.content}</p>
                        )}
                        {post.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-4 shadow-sm">
                            <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-96 object-contain" />
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-gray-400">
                          <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 transition-colors">
                            <ThumbsUp className="w-3.5 h-3.5" /> Like
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" /> Comment
                          </button>
                          <button className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-600 transition-colors">
                            <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Generic Actions/Stats */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-default border border-transparent hover:border-blue-100 group">
                    <p className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">{posts.length}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-default border border-transparent hover:border-blue-100 group">
                    <p className="text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform">0</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Connections</p>
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
