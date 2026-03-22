import { useState } from 'react';
import { Mail, Calendar, Shield, Hash, Chrome } from 'lucide-react';
import accountService from '../services/accountService';

const AccountOverview = ({ accountData, onEmailChange }) => {
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      STUDENT: 'bg-blue-100 text-blue-700 border-blue-200',
      TEACHER: 'bg-purple-100 text-purple-700 border-purple-200',
      INSTITUTE: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getEducationBadgeColor = (level) => {
    const colors = {
      SCHOOL: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      UNIVERSITY: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newEmail.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await accountService.changeEmail({ newEmail, password });
      setSuccess('Email updated successfully!');
      onEmailChange();
      
      // Reset form
      setTimeout(() => {
        setIsChangingEmail(false);
        setNewEmail('');
        setPassword('');
        setShowPassword(false);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to change email. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Account Overview</h3>
        <p className="text-sm text-gray-600 mt-1">Your account information and credentials</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid gap-6">
          {/* Account ID */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Hash className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Account ID
              </p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {accountData.id}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Email Address
              </p>
              {!isChangingEmail ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    {accountData.email}
                  </p>
                  {accountData.provider === 'local' && (
                    <button
                      onClick={() => setIsChangingEmail(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Change Email
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEmailChange} className="space-y-3 mt-2">
                  <div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to confirm"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}
                  {success && (
                    <p className="text-xs text-green-600">{success}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                    >
                      Update Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingEmail(false);
                        setNewEmail('');
                        setPassword('');
                        setError('');
                      }}
                      className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Role and Education Level */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Role & Level
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(accountData.role)}`}>
                  {accountData.role}
                </span>
                {accountData.role === 'STUDENT' && accountData.profile?.educationLevel && (
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getEducationBadgeColor(accountData.profile.educationLevel)}`}>
                    {accountData.profile.educationLevel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Account Type */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Chrome className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Account Type
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {accountData.provider === 'local' ? 'Local Account' : 'Google Account'}
                </p>
                {accountData.provider === 'google' && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    OAuth2
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          {/* Date Joined */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Member Since
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(accountData.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOverview;
