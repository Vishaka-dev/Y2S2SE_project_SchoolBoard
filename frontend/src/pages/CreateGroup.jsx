import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen, GraduationCap, Lightbulb, Layers, FlaskConical, Trophy, Heart, CheckCircle2, ImagePlus, X } from 'lucide-react';
import groupService from '../services/groupService';

const GROUP_TYPES = [
  { value: 'COURSE', label: 'Course Group', icon: BookOpen, description: 'For a specific course or module', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { value: 'BATCH', label: 'Batch Group', icon: GraduationCap, description: 'For classmates in the same batch/year', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { value: 'STUDY_GROUP', label: 'Study Group', icon: Lightbulb, description: 'For studying a topic together', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { value: 'PROJECT', label: 'Project Group', icon: Layers, description: 'For collaborating on a project', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  { value: 'EXAM_PREP', label: 'Exam Prep', icon: FlaskConical, description: 'For exam preparation and revision', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  { value: 'CLUB', label: 'Club / Community', icon: Trophy, description: 'For clubs, societies, and communities', color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { value: 'MENTORSHIP', label: 'Mentorship', icon: Heart, description: 'For mentoring and guidance', color: 'from-pink-500 to-fuchsia-600', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
];

const HELP_TEXT = {
  COURSE: { subject: 'Course name or module code (e.g., "CS101 - Data Structures")', academicLevel: 'Academic level (e.g., "Year 2 - Semester 1")' },
  BATCH: { subject: 'Program or department name', academicLevel: 'Batch year/intake (e.g., "2024 Intake")' },
  STUDY_GROUP: { subject: 'Study topic or focus area', academicLevel: 'Level of study (e.g., "Beginner", "Advanced")' },
  PROJECT: { subject: 'Project name or subject area', academicLevel: 'Project scope (e.g., "Final Year Project")' },
  EXAM_PREP: { subject: 'Exam name or subject', academicLevel: 'Exam level (e.g., "A/L 2025", "Mid-Semester")' },
  CLUB: { subject: 'Club focus or interest area', academicLevel: 'Open to all levels' },
  MENTORSHIP: { subject: 'Mentorship area or skill', academicLevel: 'Experience level required' },
};

const CreateGroup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    groupType: '',
    subject: '',
    academicLevel: '',
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState('');

  const helpText = HELP_TEXT[form.groupType] || {};

  const handleChange = (field) => (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setProfileFile(file);
      setProfilePreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeProfileImage = () => {
    setProfileFile(null);
    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }
    setProfilePreviewUrl('');
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setCoverFile(file);
      setCoverPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeCoverImage = () => {
    setCoverFile(null);
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl);
    }
    setCoverPreviewUrl('');
  };

  const handleTypeSelect = (typeValue) => {
    setError('');
    setForm((prev) => ({ ...prev, groupType: typeValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Group name is required');
      return;
    }
    if (!form.groupType) {
      setError('Please select a group type');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('groupType', form.groupType);
      formData.append('subject', form.subject.trim());
      formData.append('academicLevel', form.academicLevel.trim());

      if (profileFile) {
        formData.append('profilePicture', profileFile);
      }
      if (coverFile) {
        formData.append('coverPicture', coverFile);
      }

      const created = await groupService.createGroup(formData);
      navigate(`/groups/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/groups')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Groups
      </button>

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">Create a Group</h1>
        <p className="text-sm text-gray-500 mt-1 font-dm-sans">
          Set up an academic collaboration group for your peers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Type Selector */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Group Type <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-4 font-dm-sans">Choose the purpose of your group</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {GROUP_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = form.groupType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group/type ${
                    isSelected
                      ? `${type.border} ${type.bg} shadow-sm`
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                >
                  {isSelected && (
                    <CheckCircle2 className={`absolute top-2 right-2 w-4 h-4 ${type.text}`} />
                  )}
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center mb-2.5 group-hover/type:scale-105 transition-transform`}>
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{type.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 font-manrope">Group Details</h2>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g., CS101 Study Circle"
              maxLength={100}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              placeholder="Briefly describe the group's purpose..."
              rows={3}
              maxLength={500}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject / Category
              {form.groupType === 'COURSE' && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={handleChange('subject')}
              placeholder={helpText.subject || 'Subject or focus area'}
              maxLength={100}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Academic Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
            <input
              type="text"
              value={form.academicLevel}
              onChange={handleChange('academicLevel')}
              placeholder={helpText.academicLevel || 'Academic level or year'}
              maxLength={50}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Profile picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group profile picture <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>

            {profilePreviewUrl ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden group border border-gray-200">
                <img src={profilePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="p-1.5 bg-white/20 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload</span>
                </div>
              </label>
            )}
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group cover image <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-500 mb-2 font-dm-sans">Shown as the wide banner on the group page.</p>

            {coverPreviewUrl ? (
              <div className="relative w-full max-w-md h-28 rounded-xl overflow-hidden group border border-gray-200">
                <img src={coverPreviewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="p-1.5 bg-white/20 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full max-w-md h-28 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload cover</span>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Group'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
