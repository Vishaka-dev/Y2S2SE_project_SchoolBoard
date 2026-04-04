import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../services/userSearchService';
import { postService } from '../../services/postService';
import UserCard from '../UserCard';

const UserSearchDropdown = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    // Sanitize query: trim leading/trailing and replace multiple internal spaces with a single one
    const sanitizedQuery = query.replace(/\s+/g, ' ').trim();
    
    if (sanitizedQuery.length < 1) {
      setResults([]);
      setPostResults([]);
      setError('');
      return;
    }

    setIsOpen(true);
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const [userResponse, postResponse] = await Promise.allSettled([
          searchUsers(sanitizedQuery, 0, 10),
          postService.searchPosts(sanitizedQuery),
        ]);
        setResults(userResponse.status === 'fulfilled' ? (userResponse.value.data?.content || []) : []);
        setPostResults(postResponse.status === 'fulfilled' ? (postResponse.value || []) : []);
      } catch (searchError) {
        setResults([]);
        setPostResults([]);
        setError('Search failed. Try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setPostResults([]);
    setIsOpen(false);
  };

  const handleUserClick = (userId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${userId}`);
  };

  const handlePostClick = (post) => {
    setIsOpen(false);
    setQuery('');
    // Navigate to the post author's profile (closest available route)
    if (post.author?.id) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateContent = (content, maxLength = 80) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search users or posts..."
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-[70] max-h-[400px] overflow-y-auto p-3 space-y-1">
          {!query.trim() ? (
            <div className="py-8 text-center">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Search for users or posts</p>
              <p className="text-xs text-gray-400">Try searching "math" or a name</p>
            </div>
          ) : isLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 py-3">{error}</p>
          ) : results.length === 0 && postResults.length === 0 ? (
            <p className="text-sm text-gray-500 py-3">No results found for &apos;{query.trim()}&apos;</p>
          ) : (
            <>
              {/* Users Section */}
              {results.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1.5">Users</p>
                  <div className="space-y-1">
                    {results.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        showFollowButton={false}
                        onClick={() => handleUserClick(user.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Section */}
              {postResults.length > 0 && (
                <div>
                  {results.length > 0 && <hr className="my-2 border-gray-100" />}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1.5">Posts</p>
                  <div className="space-y-1">
                    {postResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 leading-snug line-clamp-2">
                            {truncateContent(post.content)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 font-medium">
                              {post.author?.name || 'Unknown'}
                            </span>
                            {post.createdAt && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
