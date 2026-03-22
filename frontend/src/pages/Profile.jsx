import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, Calendar, Mail, Edit, BookOpen, Award, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import TopNavbar from '../components/navbar/TopNavbar';
import postService from '../services/postService';
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { getFollowStats, getRelationship } from '../services/followService';
import FollowButton from '../components/FollowButton';
import FollowListModal from '../components/FollowListModal';

const Profile = () => {
  const { user: currentUser, getUserInitials, getRoleDisplay, getAvatarUrl, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [relationship, setRelationship] = useState({ isFollowing: false, isFollowedBy: false, isMutual: false });
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'followers' });

  const isOwnProfile = !userId || String(currentUser?.id) === String(userId);

  useEffect(() => {
    const loadProfilePage = async () => {
      try {
        setIsProfileLoading(true);
        if (!currentUser) {
          return;
        }

        let activeProfileUser = currentUser;
        if (isOwnProfile) {
          activeProfileUser = await refreshUser();
        } else {
          const profileResponse = await apiClient.get(`/users/${userId}`);
          activeProfileUser = profileResponse.data;
        }
        setProfileUser(activeProfileUser);

        if (activeProfileUser?.id) {
          const statsResponse = await getFollowStats(activeProfileUser.id);
          setFollowersCount(statsResponse.data?.followersCount || 0);
          setFollowingCount(statsResponse.data?.followingCount || 0);
        }

        if (!isOwnProfile && currentUser?.id && activeProfileUser?.id) {
          const relationshipResponse = await getRelationship(activeProfileUser.id);
          setRelationship(relationshipResponse.data || { isFollowing: false, isFollowedBy: false, isMutual: false });
        } else {
          setRelationship({ isFollowing: false, isFollowedBy: false, isMutual: false });
        }
      } catch (err) {
        console.error('Failed to load profile page:', err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfilePage();
  }, [currentUser?.id, userId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profileUser?.username) {
        return;
      }
      setIsLoadingPosts(true);
      try {
        const data = await postService.getUserPosts(profileUser.username);
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [profileUser?.username, postsRefreshKey]);

  // Re-fetch posts whenever a new post is created anywhere in the app
  useEffect(() => {
    const handlePostCreated = () => setPostsRefreshKey((k) => k + 1);
    window.addEventListener('postCreated', handlePostCreated);
    return () => window.removeEventListener('postCreated', handlePostCreated);
  }, []);

  if (!currentUser || isProfileLoading || !profileUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const getRoleBadgeColor = () => {
    switch (profileUser.role?.toUpperCase()) {
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
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Interests
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(profile?.interests) && profile.interests.length > 0 ? (
            profile.interests.map((interest, index) => (
              <span key={index} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium">
                {interest}
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
      </div>
    </div>
  );

  const renderInstituteProfile = (profile) => (
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
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden flex-col">
      <TopNavbar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 p-6 md:p-8">
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white shadow-md relative z-10 flex-shrink-0 border-4 border-gray-50 flex items-center justify-center overflow-hidden">
                    {getAvatarUrl(profileUser) ? (
                      <img
                        src={getAvatarUrl(profileUser)}
                        alt={profileUser.fullName || profileUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl md:text-4xl text-blue-600 font-bold">
                        {getUserInitials(profileUser)}
                      </span>
                    )}
                  </div>

                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2 font-manrope">
                      {profileUser.fullName || profileUser.username}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor()}`}>
                        {getRoleDisplay(profileUser)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        @{profileUser.username}
                      </span>
                    </div>
                    {!isOwnProfile && relationship.isFollowedBy && (
                      <p className="mt-2 text-xs text-gray-500">Follows you</p>
                    )}
                  </div>
                </div>

                {isOwnProfile ? (
                  <button
                    onClick={() => navigate('/account/edit-profile')}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 text-sm flex-shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <FollowButton
                    targetUserId={profileUser.id}
                    initialIsFollowing={relationship.isFollowing}
                    size="md"
                    onFollowChange={(newIsFollowing) => {
                      setRelationship((prev) => ({ ...prev, isFollowing: newIsFollowing }));
                      setFollowersCount((prev) => prev + (newIsFollowing ? 1 : -1));
                    }}
                  />
                )}
              </div>

              <div className="flex items-center gap-6 text-gray-500 text-sm flex-wrap border-t border-gray-50 pt-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{profileUser.email}</span>
                </div>
                {profileUser.profile?.province && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{profileUser.profile.province}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Joined {new Date(profileUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, mode: 'followers' })}
                  className="font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  {followersCount} Followers
                </button>
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: true, mode: 'following' })}
                  className="font-semibold text-gray-700 hover:text-blue-600 transition"
                >
                  {followingCount} Following
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {profileUser.role === 'STUDENT' && renderStudentProfile(profileUser.profile)}
              {profileUser.role === 'TEACHER' && renderTeacherProfile(profileUser.profile)}
              {profileUser.role === 'INSTITUTE' && renderInstituteProfile(profileUser.profile)}

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
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-manrope">No posts yet</h3>
                    <p className="text-gray-500 text-sm font-dm-sans">No posts to show.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                        {post.content && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap font-dm-sans">{post.content}</p>
                        )}
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt="Post image"
                            className="rounded-lg max-h-80 w-full object-cover mb-4"
                          />
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

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Posts</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{followersCount}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FollowListModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        userId={profileUser.id}
        mode={modalState.mode}
        title={modalState.mode === 'followers' ? 'Followers' : 'Following'}
      />
    </div>
  );
};

export default Profile;
