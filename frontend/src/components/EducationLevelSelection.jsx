import React from 'react';

const EducationLevelSelection = ({ onLevelSelect, onBack }) => {
  const levels = [
    {
      value: 'SCHOOL',
      title: 'School Student',
      description: 'For students in grades 1-13',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      value: 'UNIVERSITY',
      title: 'University Student',
      description: 'For undergraduate and graduate students',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Your Education Level</h2>
        <p className="text-gray-600">Choose your current education status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onLevelSelect(level.value)}
            className={`
              group relative p-8 bg-white border-2 rounded-xl 
              hover:border-${level.color}-500 transition-all duration-300
              hover:shadow-xl hover:scale-105 
              focus:outline-none focus:ring-4 focus:ring-${level.color}-200
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`
                  text-${level.color}-600 
                  group-hover:text-${level.color}-700 
                  transition-colors duration-300
                `}
              >
                {level.icon}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {level.title}
                </h3>
                <p className="text-sm text-gray-600">{level.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium
                     transition-colors duration-300 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Role Selection
        </button>
      </div>
    </div>
  );
};

export default EducationLevelSelection;
