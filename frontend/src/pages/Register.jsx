import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import StepIndicator from '../components/StepIndicator';
import RoleSelection from '../components/RoleSelection';
import EducationLevelSelection from '../components/EducationLevelSelection';
import StudentForm from '../components/StudentForm';
import TeacherForm from '../components/TeacherForm';
import InstituteForm from '../components/InstituteForm';

const Register = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [educationLevel, setEducationLevel] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Reset form when going back to role selection
  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setErrors({});
    setApiError('');
  };

  // Handle role selection (Step 1)
  const handleRoleSelect = (selectedRole) => {
    resetForm();
    setRole(selectedRole);
    setFormData({ ...formData, role: selectedRole });
    
    if (selectedRole === 'STUDENT') {
      setStep(2); // Go to education level selection
    } else {
      setEducationLevel(null);
      setStep(3); // Go directly to form
    }
  };

  // Handle education level selection (Step 2 - Students only)
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

  // Validate common fields
  const validateCommonFields = () => {
    const newErrors = {};

    if (!formData.username || formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username must not exceed 50 characters';
    }

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  // Validate student fields
  const validateStudentFields = () => {
    const newErrors = validateCommonFields();

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
    const newErrors = validateCommonFields();

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
    const newErrors = validateCommonFields();

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
      const registrationData = { ...formData };

      // Convert grade and yearOfStudy to integers if present
      if (registrationData.grade) {
        registrationData.grade = parseInt(registrationData.grade, 10);
      }
      if (registrationData.yearOfStudy) {
        registrationData.yearOfStudy = parseInt(registrationData.yearOfStudy, 10);
      }
      if (registrationData.yearsOfExperience) {
        registrationData.yearsOfExperience = parseInt(registrationData.yearsOfExperience, 10);
      }

      // Call the register service and get the response with token
      const response = await authService.register(registrationData);
      
      // For INSTITUTE role, redirect to login with verification message
      if (role === 'INSTITUTE') {
        navigate('/login', {
          state: {
            message: 'Registration successful! Your account is pending verification. You will receive an email once approved.',
          },
        });
        return;
      }

      // For STUDENT and TEACHER roles, auto-login with the returned token
      // Save token to localStorage
      authService.setToken(response.token);
      
      // Refresh user data in AuthContext
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response) {
        // Server responded with error
        if (error.response.data && error.response.data.message) {
          setApiError(error.response.data.message);
        } else if (error.response.status === 400) {
          setApiError('Invalid registration data. Please check all fields.');
        } else if (error.response.status === 409) {
          setApiError('Username or email already exists.');
        } else {
          setApiError('Registration failed. Please try again.');
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

  // Get step labels based on role
  const getStepLabels = () => {
    if (role === 'STUDENT') {
      return ['Select Role', 'Education Level', 'Complete Form'];
    }
    return ['Select Role', 'Complete Form'];
  };

  // Calculate current step for display
  const getCurrentDisplayStep = () => {
    if (role === 'STUDENT') {
      return step;
    }
    // For teacher and institute, skip step 2
    return step === 3 ? 2 : step;
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Link */}
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-8 px-4 py-2 rounded-lg border-2 border-blue-600 transition group opacity-0 animate-slideInLeft" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600 text-lg">Join LearnLink and start connecting with educators</p>
        </div>

        {/* Step Indicator */}
        {step > 1 && role && (
          <div className="mb-8">
            <StepIndicator
              currentStep={getCurrentDisplayStep()}
              totalSteps={role === 'STUDENT' ? 3 : 2}
              labels={getStepLabels()}
            />
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 opacity-0 animate-slideInUp" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
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
          {step === 1 && <RoleSelection onRoleSelect={handleRoleSelect} />}

          {/* Step 2: Education Level Selection (Students Only) */}
          {step === 2 && role === 'STUDENT' && (
            <EducationLevelSelection
              onLevelSelect={handleEducationLevelSelect}
              onBack={handleBackFromEducationLevel}
            />
          )}

          {/* Step 3: Registration Forms */}
          {step === 3 && role === 'STUDENT' && (
            <StudentForm
              educationLevel={educationLevel}
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onBack={handleBackFromForm}
              errors={errors}
              isLoading={isLoading}
            />
          )}

          {step === 3 && role === 'TEACHER' && (
            <TeacherForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onBack={handleBackFromForm}
              errors={errors}
              isLoading={isLoading}
            />
          )}

          {step === 3 && role === 'INSTITUTE' && (
            <InstituteForm
              formData={formData}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onBack={handleBackFromForm}
              errors={errors}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-700 text-base">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
