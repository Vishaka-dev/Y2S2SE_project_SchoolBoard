import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import accountService from '../services/accountService';

const EditProfile = () => {
  const [accountData, setAccountData] = useState(null);
  const [formData, setFormData] = useState({});
  const [interests, setInterests] = useState([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    setIsLoading(true);
    try {
      const data = await accountService.getAccountDetails();
      setAccountData(data);

      // Initialize form data
      if (data.profile) {
        setFormData(data.profile);
        if (data.profile.interests) {
          setInterests(Array.isArray(data.profile.interests) ? data.profile.interests : []);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load account details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddInterest = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()]);
      setCurrentInterest('');
    }
  };

  const handleRemoveInterest = (index) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    // Common validations
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (accountData.role === 'STUDENT') {
      const isSchoolStudent = accountData.profile?.educationLevel === 'SCHOOL';

      if (isSchoolStudent) {
        if (!formData.schoolName?.trim()) {
          errors.schoolName = 'School name is required';
        }
      } else {
        if (!formData.universityName?.trim()) {
          errors.universityName = 'University name is required';
        }
      }
    }

    if (accountData.role === 'TEACHER') {
      if (!formData.institutionName?.trim()) {
        errors.institutionName = 'Institution name is required';
      }
    }

    if (accountData.role === 'INSTITUTE') {
      if (!formData.institutionName?.trim()) {
        errors.institutionName = 'Institution name is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fix the errors before submitting');
      return;
    }

    setIsSaving(true);

    try {
      // Prepare update data based on role
      const updateData = { ...formData };

      // Add interests for students
      if (accountData.role === 'STUDENT') {
        updateData.interests = interests;
      }

      await accountService.updateProfile(updateData);
      setSuccess('Profile updated successfully!');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/account/settings');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStudentFields = () => {
    const isSchoolStudent = accountData.profile?.educationLevel === 'SCHOOL';

    return (
      <>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border ${fieldErrors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter your full name"
          />
          {fieldErrors.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your province"
          />
        </div>

        {/* Interests */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add an interest and press Enter"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(interests) && interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 flex items-center gap-2"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className="hover:text-purple-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 border-t border-gray-200 pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            {isSchoolStudent ? 'School Information' : 'University Information'}
          </h4>
        </div>

        {isSchoolStudent ? (
          <>
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${fieldErrors.schoolName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter school name"
              />
              {fieldErrors.schoolName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.schoolName}</p>
              )}
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Grade 10"
              />
            </div>
          </>
        ) : (
          <>
            {/* University Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                University Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="universityName"
                value={formData.universityName || ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border ${fieldErrors.universityName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter university name"
              />
              {fieldErrors.universityName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.universityName}</p>
              )}
            </div>

            {/* Degree Program */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Program
              </label>
              <input
                type="text"
                name="degreeProgram"
                value={formData.degreeProgram || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Computer Science"
              />
            </div>

            {/* Year of Study */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Study
              </label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select year</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
                <option value="5">Year 5+</option>
              </select>
            </div>
          </>
        )}
      </>
    );
  };

  const renderTeacherFields = () => {
    return (
      <>
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border ${fieldErrors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter your full name"
          />
          {fieldErrors.fullName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your province"
          />
        </div>

        <div className="md:col-span-2 border-t border-gray-200 pt-6">
          <h4 className="text-base font-semibold text-gray-900 mb-4">
            Professional Information
          </h4>
        </div>

        {/* Institution Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border ${fieldErrors.institutionName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter institution name"
          />
          {fieldErrors.institutionName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.institutionName}</p>
          )}
        </div>

        {/* Subject Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Specialization
          </label>
          <input
            type="text"
            name="subjectSpecialization"
            value={formData.subjectSpecialization || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Mathematics, Physics"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualifications
          </label>
          <input
            type="text"
            name="qualifications"
            value={formData.qualifications || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., M.Sc., Ph.D."
          />
        </div>
      </>
    );
  };

  const renderInstituteFields = () => {
    return (
      <>
        {/* Institution Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institution Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="institutionName"
            value={formData.institutionName || ''}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 border ${fieldErrors.institutionName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Enter institution name"
          />
          {fieldErrors.institutionName && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.institutionName}</p>
          )}
        </div>

        {/* Province */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Province
          </label>
          <input
            type="text"
            name="province"
            value={formData.province || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter province"
          />
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District
          </label>
          <input
            type="text"
            name="district"
            value={formData.district || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter district"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full address"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Person
          </label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact person name"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter contact number"
          />
        </div>

        {/* Website */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            name="website"
            value={formData.website || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </>
    );
  };

  const renderFormFields = () => {
    if (!accountData) return null;

    switch (accountData.role) {
      case 'STUDENT':
        return renderStudentFields();
      case 'TEACHER':
        return renderTeacherFields();
      case 'INSTITUTE':
        return renderInstituteFields();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-dm-sans">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-dm-sans">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/account/settings')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
              </button>
              <h1 className="text-3xl font-bold text-gray-900 font-manrope">Edit Profile</h1>
              <p className="text-gray-600 mt-2">Update your profile information</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormFields()}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 lg:px-8 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/account/settings')}
                  disabled={isSaving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm hover:shadow flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
