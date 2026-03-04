import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';
import accountService from '../services/accountService';
import { useNavigate } from 'react-router-dom';

const DangerZone = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteAccount = async (deleteData) => {
    setIsDeleting(true);
    setError('');

    try {
      await accountService.deleteAccount(deleteData);
      
      // Clear authentication
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show success message and redirect
      navigate('/login', { 
        state: { message: 'Your account has been deleted successfully.' }
      });
    } catch (err) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Irreversible and destructive actions
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h4 className="text-base font-semibold text-gray-900 mb-1">
                Delete Account
              </h4>
              <p className="text-sm text-gray-600">
                Once you delete your account, there is no going back. Your account will be deactivated
                and you'll no longer be able to access the platform.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap flex items-center gap-2 shadow-sm hover:shadow"
            >
              <AlertTriangle className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <DeleteAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeleting}
      />
    </>
  );
};

export default DangerZone;
