import React from 'react';

const RoleSelection = ({ onRoleSelect }) => {
  const roles = [
    {
      value: 'STUDENT',
      title: 'Student',
      description: 'For school and university students',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l9-5-9-5-9 5 9 5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          />
        </svg>
      ),
      color: 'blue',
    },
    {
      value: 'TEACHER',
      title: 'Teacher',
      description: 'For educators and instructors',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
      color: 'green',
    },
    {
      value: 'INSTITUTE',
      title: 'Institute',
      description: 'For educational institutions',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
        <p className="text-gray-600">Select the option that best describes you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => onRoleSelect(role.value)}
            className={`
              group relative p-6 bg-white border-2 rounded-xl 
              hover:border-${role.color}-500 transition-all duration-300
              hover:shadow-xl hover:scale-105 
              focus:outline-none focus:ring-4 focus:ring-${role.color}-200
            `}
          >
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`
                  text-${role.color}-600 
                  group-hover:text-${role.color}-700 
                  transition-colors duration-300
                `}
              >
                {role.icon}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            </div>
            <div
              className={`
                absolute inset-0 border-2 border-${role.color}-500 rounded-xl 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
              `}
            ></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
