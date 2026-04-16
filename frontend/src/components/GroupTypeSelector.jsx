const GROUP_TYPE_OPTIONS = [
  { value: 'COURSE', label: 'Course', description: 'For subject-based class communities.' },
  { value: 'BATCH', label: 'Batch', description: 'For an academic intake, year, or cohort.' },
  { value: 'STUDY_GROUP', label: 'Study Group', description: 'For revision circles and peer learning.' },
  { value: 'PROJECT', label: 'Project', description: 'For assignment and team collaboration.' },
  { value: 'EXAM_PREP', label: 'Exam Prep', description: 'For targeted exam preparation.' },
  { value: 'CLUB', label: 'Club', description: 'For extracurricular and society activities.' },
  { value: 'MENTORSHIP', label: 'Mentorship', description: 'For mentor-mentee learning spaces.' },
];

const GroupTypeSelector = ({ value, onChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      <label htmlFor="groupType" className="block text-sm font-semibold text-gray-800">
        Group Type
      </label>
      <select
        id="groupType"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <option value="">Select a group type</option>
        {GROUP_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="grid gap-2 sm:grid-cols-2">
        {GROUP_TYPE_OPTIONS.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50/40'
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-1 text-xs text-gray-500">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default GroupTypeSelector;
