import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, BookOpen, Briefcase, Building2, Edit, GraduationCap, Sparkles } from 'lucide-react';
import AccountOverview from '../components/AccountOverview';
import SecuritySection from '../components/SecuritySection';
import DangerZone from '../components/DangerZone';
import accountService from '../services/accountService';

const AccountSettings = () => {
  const [accountData, setAccountData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await accountService.getAccountDetails();
      setAccountData(data);
    } catch (err) {
      setError(err.message || 'Failed to load account details');
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileIcon = (role) => {
    const icons = {
      STUDENT: BookOpen,
      TEACHER: GraduationCap,
      INSTITUTE: Building2
    };
    return icons[role] || User;
  };

  const renderProfileField = (label, value, icon) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-sm font-semibold text-gray-900 break-words">
            {value}
          </p>
        </div>
      </div>
    );
  };

  const renderInterests = (interests) => {
    if (!interests || interests.length === 0) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStudentProfile = (profile) => {
    const isSchoolStudent = profile.educationLevel === 'SCHOOL';

    return (
      <div className="space-y-4">
        {renderProfileField('Full Name', profile.fullName, <User className="w-4 h-4 text-gray-600" />)}
        {profile.dateOfBirth && renderProfileField('Date of Birth', new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), <User className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Province', profile.province, <MapPin className="w-4 h-4 text-gray-600" />)}
        {renderInterests(profile.interests)}
        
        <div className="border-t border-gray-100 pt-4 mt-4"></div>
        
        {isSchoolStudent ? (
          <>
            {renderProfileField('School', profile.schoolName, <BookOpen className="w-4 h-4 text-blue-600" />)}
            {renderProfileField('Grade', profile.grade, <GraduationCap className="w-4 h-4 text-blue-600" />)}
          </>
        ) : (
          <>
            {renderProfileField('University', profile.universityName, <BookOpen className="w-4 h-4 text-indigo-600" />)}
            {renderProfileField('Degree Program', profile.degreeProgram, <GraduationCap className="w-4 h-4 text-indigo-600" />)}
            {renderProfileField('Year of Study', `Year ${profile.yearOfStudy}`, <GraduationCap className="w-4 h-4 text-indigo-600" />)}
          </>
        )}
      </div>
    );
  };

  const renderTeacherProfile = (profile) => {
    return (
      <div className="space-y-4">
        {renderProfileField('Full Name', profile.fullName, <User className="w-4 h-4 text-gray-600" />)}
        {profile.dateOfBirth && renderProfileField('Date of Birth', new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), <User className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Province', profile.province, <MapPin className="w-4 h-4 text-gray-600" />)}
        
        <div className="border-t border-gray-100 pt-4 mt-4"></div>
        
        {renderProfileField('Institution', profile.institutionName, <Building2 className="w-4 h-4 text-purple-600" />)}
        {renderProfileField('Specialization', profile.subjectSpecialization, <BookOpen className="w-4 h-4 text-purple-600" />)}
        {renderProfileField('Experience', `${profile.yearsOfExperience} years`, <Briefcase className="w-4 h-4 text-purple-600" />)}
        {renderProfileField('Qualifications', profile.qualifications, <GraduationCap className="w-4 h-4 text-purple-600" />)}
      </div>
    );
  };

  const renderInstituteProfile = (profile) => {
    return (
      <div className="space-y-4">
        {renderProfileField('Institution Name', profile.institutionName, <Building2 className="w-4 h-4 text-green-600" />)}
        {renderProfileField('Province', profile.province, <MapPin className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('District', profile.district, <MapPin className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Address', profile.address, <MapPin className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Contact Person', profile.contactPerson, <User className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Contact Number', profile.contactNumber, <User className="w-4 h-4 text-gray-600" />)}
        {renderProfileField('Website', profile.website, <Building2 className="w-4 h-4 text-green-600" />)}
      </div>
    );
  };

  const renderProfile = () => {
    if (!accountData?.profile) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No profile information available</p>
        </div>
      );
    }

    switch (accountData.role) {
      case 'STUDENT':
        return renderStudentProfile(accountData.profile);
      case 'TEACHER':
        return renderTeacherProfile(accountData.profile);
      case 'INSTITUTE':
        return renderInstituteProfile(accountData.profile);
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 font-manrope">Account Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account, security, and preferences</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Content */}
            <div className="space-y-6">
              {/* Account Overview */}
              <AccountOverview 
                accountData={accountData} 
                onEmailChange={fetchAccountData}
              />

              {/* Profile Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                      <p className="text-sm text-gray-600 mt-1">Your public profile details</p>
                    </div>
                    <button
                      onClick={() => navigate('/account/edit-profile')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {renderProfile()}
                </div>
              </div>

              {/* Security Section */}
              <SecuritySection accountData={accountData} />

              {/* Danger Zone */}
              <DangerZone />
            </div>
          </div>
    </div>
  );
};

export default AccountSettings;
