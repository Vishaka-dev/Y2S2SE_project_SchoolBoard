import { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 1) {
      setResults([]);
      setError('');
      return;
    }

    setIsOpen(true);
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const [userResponse, postResponse] = await Promise.allSettled([
          searchUsers(trimmedQuery, 0, 10),
          postService.searchPosts(trimmedQuery),
        ]);
        setResults(userResponse.status === 'fulfilled' ? (userResponse.value.data?.content || []) : []);
        setPostResults(postResponse.status === 'fulfilled' ? (postResponse.value || []) : []);

        // Dispatch post search results to Home page
        window.dispatchEvent(new CustomEvent('postSearch', { detail: { keyword: trimmedQuery } }));
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

  const handleResultClick = (userId) => {
    setIsOpen(false);
    setQuery('');
    // Clear post search when navigating to a profile
    window.dispatchEvent(new CustomEvent('postSearch', { detail: { keyword: '' } }));
    navigate(`/profile/${userId}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const trimmed = query.trim();
      window.dispatchEvent(new CustomEvent('postSearch', { detail: { keyword: trimmed } }));
      setIsOpen(false);
    }
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
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Search users or posts..."
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:text-sm transition"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-[70] max-h-[400px] overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 py-3">{error}</p>
          ) : results.length === 0 && postResults.length === 0 ? (
            <p className="text-sm text-gray-500 py-3">No results found for '{query.trim()}'</p>
          ) : (
            results.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                showFollowButton={false}
                onClick={() => handleResultClick(user.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchDropdown;
