import { useState } from 'react';
import { ImagePlus, Users, Globe2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupTypeSelector from '../components/GroupTypeSelector';
import groupService from '../services/groupService';

const initialForm = {
  name: '',
  description: '',
  groupType: '',
  subject: '',
  academicLevel: '',
  imageUrl: '',
  visibility: 'PUBLIC',
};

const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) nextErrors.name = 'Group name is required.';
    if (!formData.groupType) nextErrors.groupType = 'Choose a group type.';
    if (!formData.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!formData.academicLevel.trim()) nextErrors.academicLevel = 'Academic level is required.';

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const createdGroup = await groupService.createGroup({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        subject: formData.subject.trim(),
        academicLevel: formData.academicLevel.trim(),
        imageUrl: formData.imageUrl.trim(),
      });

      navigate(`/groups/${createdGroup.id}`);
    } catch (error) {
      const validationMap = error.validationErrors || {};
      if (Object.keys(validationMap).length > 0) {
        setErrors(validationMap);
      }
      setSubmitError(error.message || 'Failed to create group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-gray-100 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 px-6 py-8 text-white shadow-sm md:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Group Creation</p>
          <h1 className="mt-3 text-3xl font-bold">Create a learning space in minutes</h1>
          <p className="mt-3 text-sm leading-6 text-blue-50">
            Keep it simple like a chat group setup, then add the academic context that helps the right people join.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div>
              <label htmlFor="groupName" className="block text-sm font-semibold text-gray-800">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="e.g. Advanced Physics Revision Circle"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              {errors.name && <p className="mt-2 text-xs font-medium text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="groupDescription" className="block text-sm font-semibold text-gray-800">
                Description
              </label>
              <textarea
                id="groupDescription"
                rows={5}
                value={formData.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="What will this group be used for?"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              {errors.description && <p className="mt-2 text-xs font-medium text-red-600">{errors.description}</p>}
            </div>

            <GroupTypeSelector
              value={formData.groupType}
              onChange={(value) => updateField('groupType', value)}
              disabled={isSubmitting}
            />
            {errors.groupType && <p className="-mt-3 text-xs font-medium text-red-600">{errors.groupType}</p>}

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="groupSubject" className="block text-sm font-semibold text-gray-800">
                  Subject
                </label>
                <input
                  id="groupSubject"
                  type="text"
                  value={formData.subject}
                  onChange={(event) => updateField('subject', event.target.value)}
                  placeholder="Mathematics, Biology, ICT..."
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {errors.subject && <p className="mt-2 text-xs font-medium text-red-600">{errors.subject}</p>}
              </div>

              <div>
                <label htmlFor="academicLevel" className="block text-sm font-semibold text-gray-800">
                  Academic Level
                </label>
                <input
                  id="academicLevel"
                  type="text"
                  value={formData.academicLevel}
                  onChange={(event) => updateField('academicLevel', event.target.value)}
                  placeholder="Grade 13, Year 2, Undergraduate..."
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                {errors.academicLevel && <p className="mt-2 text-xs font-medium text-red-600">{errors.academicLevel}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="groupImageUrl" className="block text-sm font-semibold text-gray-800">
                Group Image URL
              </label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3">
                <ImagePlus className="h-5 w-5 text-gray-400" />
                <input
                  id="groupImageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(event) => updateField('imageUrl', event.target.value)}
                  placeholder="Optional cover image link"
                  className="w-full border-none p-0 text-sm text-gray-900 outline-none"
                />
              </div>
              {errors.imageUrl && <p className="mt-2 text-xs font-medium text-red-600">{errors.imageUrl}</p>}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-5">
              <p className="text-sm font-semibold text-blue-900">Visibility</p>
              <div className="mt-4 space-y-3">
                {[
                  {
                    value: 'PUBLIC',
                    label: 'Public Group',
                    description: 'Any authenticated learner can discover and join.',
                    icon: Globe2,
                  },
                  {
                    value: 'PRIVATE',
                    label: 'Private Group',
                    description: 'Only members can view the details and member list.',
                    icon: Lock,
                  },
                ].map((option) => {
                  const Icon = option.icon;
                  const active = formData.visibility === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('visibility', option.value)}
                      className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? 'border-blue-500 bg-white shadow-sm'
                          : 'border-blue-100 bg-white/70 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                          <p className="mt-1 text-xs leading-5 text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-100 bg-gray-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Automatic Ownership</p>
                  <p className="text-xs text-gray-500">You’ll be added as the group owner as soon as it’s created.</p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating group...' : 'Create Group'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
