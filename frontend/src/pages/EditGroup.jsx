import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditGroup = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    groupType: '',
    subject: '',
    academicLevel: '',
  });
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  const helpText = HELP_TEXT[form.groupType] || {};

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const serverUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  useEffect(() => {
    const loadGroup = async () => {
      setIsLoading(true);
      try {
        const group = await groupService.getGroupById(groupId);
        if (!['OWNER', 'ADMIN'].includes(group.currentUserRole)) {
          navigate(`/groups/${groupId}`);
          return;
        }
        setForm({
          name: group.name || '',
          description: group.description || '',
          groupType: group.groupType || '',
          subject: group.subject || '',
          academicLevel: group.academicLevel || '',
        });
        setCurrentImageUrl(group.imageUrl || '');
      } catch (err) {
        setError(err.message || 'Failed to load group');
      } finally {
        setIsLoading(false);
      }
    };

    loadGroup();
  }, [groupId, navigate]);

  const handleChange = (field) => (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTypeSelect = (typeValue) => {
    setError('');
    setForm((prev) => ({ ...prev, groupType: typeValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
    setError('');
  };

  const removeSelectedImage = () => {
    setImageFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl('');
    setRemoveImage(true);
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
      formData.append('removeImage', removeImage ? 'true' : 'false');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const updated = await groupService.updateGroup(groupId, formData);
      navigate(`/groups/${updated.id}`);
    } catch (err) {
      setError(err.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium font-dm-sans">Loading group details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-8">
      <button
        onClick={() => navigate(`/groups/${groupId}`)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Group
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 font-manrope">Edit Group</h1>
        <p className="text-sm text-gray-500 mt-1 font-dm-sans">
          Update your group details and profile image
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 font-manrope">Group Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              maxLength={100}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              rows={3}
              maxLength={500}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Category</label>
            <input
              type="text"
              value={form.subject}
              onChange={handleChange('subject')}
              placeholder={helpText.subject || 'Subject or focus area'}
              maxLength={100}
              className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Profile Picture <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>

            {(imagePreviewUrl || currentImageUrl) ? (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden group border border-gray-200">
                <img src={imagePreviewUrl || resolveImageUrl(currentImageUrl)} alt="Group preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeSelectedImage}
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
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-xs font-medium">Upload</span>
                </div>
              </label>
            )}

            {(imagePreviewUrl || currentImageUrl) && (
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => {
                      setRemoveImage(e.target.checked);
                      if (e.target.checked) {
                        if (imagePreviewUrl) {
                          URL.revokeObjectURL(imagePreviewUrl);
                        }
                        setImagePreviewUrl('');
                        setImageFile(null);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remove current image
                </label>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/groups/${groupId}`)}
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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGroup;
