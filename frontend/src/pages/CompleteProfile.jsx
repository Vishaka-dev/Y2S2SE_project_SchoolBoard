import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import StudentForm from '../components/StudentForm';
import TeacherForm from '../components/TeacherForm';
import InstituteForm from '../components/InstituteForm';
import RoleSelection from '../components/RoleSelection';
import EducationLevelSelection from '../components/EducationLevelSelection';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [educationLevel, setEducationLevel] = useState(null);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Get pre-filled data from OAuth2 redirect if available
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    const userIdParam = searchParams.get('userId');

    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam, userId: userIdParam }));
    }
  }, [location]);

  // Handle role selection
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setFormData({ ...formData, role: selectedRole });

    if (selectedRole === 'STUDENT') {
      setStep(2); // Go to education level selection
    } else {
      setEducationLevel(null);
      setStep(3); // Go directly to form
    }
  };

  // Handle education level selection (Students only)
  const handleEducationLevelSelect = (level) => {
    setEducationLevel(level);
    setFormData({ ...formData, educationLevel: level });
    setStep(3);
  };

  // Handle going back from education level selection
  const handleBackFromEducationLevel = () => {
    setEducationLevel(null);
    setStep(1);
  };

  // Handle going back from form
  const handleBackFromForm = () => {
    if (role === 'STUDENT') {
      setStep(2); // Back to education level
    } else {
      setStep(1); // Back to role selection
    }
    setErrors({});
    setApiError('');
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  // Validate student fields
  const validateStudentFields = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.interests || formData.interests.trim().length === 0) {
      newErrors.interests = 'Please share your interests';
    }

    if (educationLevel === 'SCHOOL') {
      if (!formData.schoolName || formData.schoolName.trim().length === 0) {
        newErrors.schoolName = 'School name is required';
      }
      if (!formData.grade) {
        newErrors.grade = 'Grade is required';
      }
    } else if (educationLevel === 'UNIVERSITY') {
      if (!formData.universityName || formData.universityName.trim().length === 0) {
        newErrors.universityName = 'University name is required';
      }
      if (!formData.degreeProgram || formData.degreeProgram.trim().length === 0) {
        newErrors.degreeProgram = 'Degree program is required';
      }
      if (!formData.yearOfStudy) {
        newErrors.yearOfStudy = 'Year of study is required';
      }
    }

    return newErrors;
  };

  // Validate teacher fields
  const validateTeacherFields = () => {
    const newErrors = {};

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.institutionName || formData.institutionName.trim().length === 0) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.subjectSpecialization || formData.subjectSpecialization.trim().length === 0) {
      newErrors.subjectSpecialization = 'Subject specialization is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    return newErrors;
  };

  // Validate institute fields
  const validateInstituteFields = () => {
    const newErrors = {};

    if (!formData.institutionName || formData.institutionName.trim().length === 0) {
      newErrors.institutionName = 'Institution name is required';
    }

    if (!formData.institutionType) {
      newErrors.institutionType = 'Institution type is required';
    }

    if (!formData.registrationNumber || formData.registrationNumber.trim().length === 0) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    if (!formData.province) {
      newErrors.province = 'Province is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.address || formData.address.trim().length === 0) {
      newErrors.address = 'Address is required';
    }

    if (!formData.contactPerson || formData.contactPerson.trim().length === 0) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.contactNumber || formData.contactNumber.trim().length === 0) {
      newErrors.contactNumber = 'Contact number is required';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate based on role
    let validationErrors = {};
    if (role === 'STUDENT') {
      validationErrors = validateStudentFields();
    } else if (role === 'TEACHER') {
      validationErrors = validateTeacherFields();
    } else if (role === 'INSTITUTE') {
      validationErrors = validateInstituteFields();
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const profileData = { ...formData };

      // Convert grade and yearOfStudy to integers if present
      if (profileData.grade) {
        profileData.grade = parseInt(profileData.grade, 10);
      }
      if (profileData.yearOfStudy) {
        profileData.yearOfStudy = parseInt(profileData.yearOfStudy, 10);
      }
      if (profileData.yearsOfExperience) {
        profileData.yearsOfExperience = parseInt(profileData.yearsOfExperience, 10);
      }

      // Call the completeProfile service
      await authService.completeProfile(profileData);

      // Success - redirect to dashboard
      navigate('/dashboard', {
        state: {
          message: 'Profile completed successfully! Welcome to LearnLink.',
        },
      });
    } catch (error) {
      console.error('Profile completion error:', error);

      if (error.response) {
        // Server responded with error
        if (error.response.data && error.response.data.message) {
          setApiError(error.response.data.message);
        } else if (error.response.status === 400) {
          setApiError('Invalid profile data. Please check all fields.');
        } else {
          setApiError('Profile completion failed. Please try again.');
        }
      } else if (error.request) {
        // Request made but no response
        setApiError('Cannot connect to server. Please check your connection.');
      } else {
        // Other errors
        setApiError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-blue-50 py-12 px-4">
      {/* Diagonal Stripes Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ transform: 'skewX(-15deg)', transformOrigin: 'top left', marginLeft: '-10%' }}>
        <div className="w-full h-full flex">
          <div className="flex-1 bg-blue-100"></div>
          <div className="flex-1 bg-blue-200"></div>
          <div className="flex-1 bg-blue-300"></div>
          <div className="flex-1 bg-blue-400"></div>
          <div className="flex-1 bg-blue-500"></div>
          <div className="flex-1 bg-blue-600"></div>
          <div className="flex-1 bg-blue-700"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-700 text-lg">
            Tell us more about yourself to get the most out of LearnLink
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-3">
              <svg
                className="w-5 h-5 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{apiError}</p>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {step === 1 && !role && <RoleSelection onRoleSelect={handleRoleSelect} />}

          {/* Step 2: Education Level Selection (Students Only) */}
          {step === 2 && role === 'STUDENT' && (
            <EducationLevelSelection
              onLevelSelect={handleEducationLevelSelect}
              onBack={handleBackFromEducationLevel}
            />
          )}

          {/* Step 3: Profile Forms */}
          {step === 3 && role === 'STUDENT' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Username and password fields are not required for OAuth2
                  accounts. Your email is already verified.
                </p>
              </div>
              <StudentForm
                educationLevel={educationLevel}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={handleBackFromForm}
                errors={errors}
                isLoading={isLoading}
              />
            </div>
          )}

          {step === 3 && role === 'TEACHER' && (
            <div>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Username and password fields are not required for OAuth2
                  accounts. Your email is already verified.
                </p>
              </div>
              <TeacherForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={handleBackFromForm}
                errors={errors}
                isLoading={isLoading}
              />
            </div>
          )}

          {step === 3 && role === 'INSTITUTE' && (
            <div>
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Note:</strong> Username and password fields are not required for OAuth2
                  accounts. Your email is already verified.
                </p>
              </div>
              <InstituteForm
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={handleBackFromForm}
                errors={errors}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
