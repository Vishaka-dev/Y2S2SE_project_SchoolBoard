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
  const getUserInitials = () => {
    if (!user) return '?';
    
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '?';
  };

  // Get role display name
  const getRoleDisplay = () => {
    if (!user || !user.role) return 'User';
    
    const roleMap = {
      STUDENT: 'Student',
      TEACHER: 'Teacher',
      INSTITUTE: 'Institute'
    };
    
    return roleMap[user.role] || user.role;
  };

  const value = {
    user,
    loading,
    error,
    refreshUser,
    logout,
    getUserInitials,
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
