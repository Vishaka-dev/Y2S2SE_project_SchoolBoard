import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Loader2 } from 'lucide-react';
import accountService from '../services/accountService';
import { useAuth } from '../context/AuthContext';

const ConfirmDelete = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await accountService.confirmGoogleDelete(token);
      
      // Clear all authentication using context
      if (logout) {
        await logout();
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      navigate('/login', { 
        state: { message: 'Your account has been deleted successfully.' }
      });
    } catch (err) {
      setError(err.message || 'Failed to delete account. The link may have expired.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-sm border border-red-200 p-8 pb-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          Are you completely sure?
        </h2>
        
        <p className="text-center text-gray-600 mb-8 leading-relaxed">
          This action cannot be undone. All your posts, followers, resources, groups, and profile information will be permanently deleted and lost forever.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all disabled:opacity-50 hover:shadow-md transform active:scale-[0.98]"
          >
            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
            I understand, delete my account
          </button>
          
          <button
            onClick={() => navigate('/feed')}
            disabled={isDeleting}
            className="w-full py-3.5 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            Cancel and return
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
