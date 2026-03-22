import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const OAuth2Redirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log('=== OAuth2 Redirect Page Loaded ===');
      console.log('Current URL:', window.location.href);
      
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      console.log('Token from URL:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('Error from URL:', errorParam);

      if (token) {
        console.log('Saving token to localStorage');
        authService.setToken(token);
        
        try {
          // Refresh user data in AuthContext
          await refreshUser();
          console.log('Redirecting to dashboard');
          navigate('/dashboard');
        } catch (err) {
          console.error('Failed to fetch user after OAuth:', err);
          setError('Failed to load user data. Please try logging in again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else if (errorParam) {
        const decodedError = decodeURIComponent(errorParam);
        console.error('OAuth2 Error:', decodedError);
        setError(decodedError);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        console.error('No token or error received');
        setError('No token received from OAuth2 provider');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Processing Authentication</h3>
          <p className="mt-2 text-sm text-gray-500">Please wait while we complete your login...</p>
        </div>
      </div>
    </div>
  );
};

export default OAuth2Redirect;
