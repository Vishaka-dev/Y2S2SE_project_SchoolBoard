import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await accountService.getAccountDetails();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError(err.message || 'Failed to load user data');
        // Note: 401 errors are handled globally by axios interceptor
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Refresh user data
  const refreshUser = async () => {
    try {
      setError(null);
      const userData = await accountService.getAccountDetails();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      setError(err.message || 'Failed to refresh user data');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = (currentUser = user) => {
    if (!currentUser) return '?';

    if (currentUser.fullName) {
      return currentUser.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }

    if (currentUser.email) {
      return currentUser.email[0].toUpperCase();
    }

    return '?';
  };

  const getAvatarUrl = (currentUser = user) => {
    if (!currentUser) return null;

    // Check for profile picture - handle both imageUrl and profilePicture naming
    const imgUrl = currentUser.imageUrl || currentUser.profilePicture;

    if (!imgUrl) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName || currentUser.email || 'User')}&background=3b82f6&color=fff`;
    }

    // If it's already a full HTTP URL (like from backend: http://localhost:8080/uploads/...)
    // we should return it as is.
    if (imgUrl.startsWith('http')) {
      return imgUrl;
    }

    // Handle relative paths provided by backend
    // If path starts with uploads or /uploads, it's a profile image
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');
    
    // Ensure properly formatted path
    const cleanPath = imgUrl.startsWith('/') ? imgUrl : `/${imgUrl}`;

    return `${serverUrl}${cleanPath}`;
  };

  // Get role display name
  const getRoleDisplay = (currentUser = user) => {
    if (!currentUser || !currentUser.role) return 'User';

    const roleMap = {
      STUDENT: 'Student',
      TEACHER: 'Teacher',
      INSTITUTE: 'Institute'
    };

    return roleMap[currentUser.role] || currentUser.role;
  };

  const value = {
    user,
    loading,
    error,
    refreshUser,
    logout,
    getUserInitials,
    getAvatarUrl,
    getRoleDisplay,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
