import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Image, Video, Calendar, ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import RoleBasedWidget from '../components/widgets/RoleBasedWidget';

const Home = () => {
  const { user, getUserInitials } = useAuth();
  const [postContent, setPostContent] = useState('');

  // Mock feed posts - Replace with API calls
  const feedPosts = [
    {
      id: 1,
      author: {
        name: 'Dr. Emily Chen',
        role: 'Mathematics Teacher',
        avatar: null,
        initials: 'EC'
      },
      timestamp: '2 hours ago',
      content: 'Excited to announce a new advanced calculus course starting next month! Students interested in diving deep into differential equations and real analysis are welcome to join. Limited seats available. 📚',
      likes: 45,
      comments: 12,
      shares: 3
    },
    {
      id: 2,
      author: {
        name: 'Michael Anderson',
        role: 'Computer Science Student',
        avatar: null,
        initials: 'MA'
      },
      timestamp: '5 hours ago',
      content: 'Just finished my first full-stack project using React and Node.js! Building a student collaboration platform was challenging but incredibly rewarding. Thanks to all the teachers who provided guidance. 🚀',
      media: {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Project+Screenshot'
      },
      likes: 89,
      comments: 23,
      shares: 7
    },
    {
      id: 3,
      author: {
        name: 'Harvard University',
        role: 'Institute',
        avatar: null,
        initials: 'HU'
      },
      timestamp: '1 day ago',
      content: 'Important announcement: Our virtual Open House event is scheduled for March 15th. Join us to learn about our programs, meet faculty, and connect with current students. Register now! 🎓',
      likes: 234,
      comments: 56,
      shares: 89
    }
  ];

  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    // TODO: Implement actual post creation API call
    console.log('Creating post:', postContent);
    setPostContent('');
    
    // Show success message
    alert('Post created successfully!');
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toUpperCase()) {
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

  return (
    <div className="space-y-6">
      {/* Role-Based Widget */}
      <RoleBasedWidget />

      {/* Create Post Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-4">
          {/* User Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user.fullName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-sm">{getUserInitials()}</span>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Start a post... Share your thoughts, achievements, or questions"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              rows="3"
            />
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Image className="w-4 h-4" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Video className="w-4 h-4" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Event</span>
                </button>
              </div>

              <button
                onClick={handleCreatePost}
                disabled={!postContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {feedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                {/* Author Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{post.author.initials}</span>
                  )}
                </div>

                {/* Author Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {post.author.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(post.author.role)}`}>
                      {post.author.role}
                    </span>
                    <span className="text-xs text-gray-500">{post.timestamp}</span>
                  </div>
                </div>
              </div>

              {/* More Options */}
              <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

            {/* Media (if any) */}
            {post.media && (
              <div className="mb-4 rounded-xl overflow-hidden">
                <img 
                  src={post.media.url} 
                  alt="Post media"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 mb-3 border-b border-gray-100">
              <span>{post.likes} likes</span>
              <span>{post.comments} comments</span>
              <span>{post.shares} shares</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition group">
                <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <button className="px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-xl font-medium transition">
          Load more posts
        </button>
      </div>
    </div>
  );
};

export default Home;
