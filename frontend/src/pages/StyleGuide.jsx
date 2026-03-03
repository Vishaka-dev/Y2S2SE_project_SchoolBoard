import React from 'react';

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-dm-sans animate-fade-in text-gray-900">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="pb-6 border-b border-gray-300">
          <h1 className="text-2xl md:text-4xl font-bold font-manrope text-blue-600 mb-2">
            LearnLink Style Guide
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            A living document of our UI components. Use these exact classes when building new features.
          </p>
        </div>

        {/* 1. Typography */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold font-manrope border-b border-gray-300 pb-2">1. Typography</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div>
              <span className="text-xs text-gray-500 font-mono block mb-1">text-2xl md:text-4xl font-bold font-manrope</span>
              <h1 className="text-2xl md:text-4xl font-bold font-manrope text-gray-900">Page Title (H1)</h1>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-mono block mb-1">text-lg md:text-xl font-semibold font-manrope</span>
              <h2 className="text-lg md:text-xl font-semibold font-manrope text-gray-900">Section Header (H2)</h2>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-mono block mb-1">text-sm md:text-base font-dm-sans text-gray-700</span>
              <p className="text-sm md:text-base text-gray-700">
                Standard body paragraph. This is how normal text will look in the feed, comments, and descriptions. It uses DM Sans for maximum readability.
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-mono block mb-1">text-xs md:text-sm text-gray-500</span>
              <p className="text-xs md:text-sm text-gray-500">Helper text, timestamps, or secondary info.</p>
            </div>
          </div>
        </section>

        {/* 2. Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold font-manrope border-b border-gray-300 pb-2">2. Buttons</h2>
          <div className="flex flex-wrap gap-4 md:gap-6 bg-white p-6 rounded-lg shadow-md border border-gray-100 items-center">
            
            {/* Primary */}
            <button className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors py-2 px-4 text-sm md:text-base">
              Primary Button
            </button>
            
            {/* Secondary */}
            <button className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors py-2 px-4 text-sm md:text-base">
              Secondary Outline
            </button>

            {/* Destructive */}
            <button className="bg-red-600 text-white border border-red-600 hover:bg-red-700 font-medium rounded-lg shadow-sm transition-colors py-2 px-4 text-sm md:text-base">
              Delete Button
            </button>

            {/* Disabled */}
            <button disabled className="bg-blue-600 text-white border border-blue-600 font-medium rounded-lg shadow-sm py-2 px-4 text-sm md:text-base opacity-50 cursor-not-allowed">
              Disabled State
            </button>
          </div>
        </section>

        {/* 3. Form Inputs */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold font-manrope border-b border-gray-300 pb-2">3. Form Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            
            {/* Standard Input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Standard Input</label>
              <input 
                type="text" 
                placeholder="Enter text..." 
                className="bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Error Input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Error State</label>
              <input 
                type="text" 
                defaultValue="Invalid email" 
                className="bg-white border rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 focus:outline-none border-red-300 focus:ring-2 focus:ring-red-500 transition-colors"
              />
              <span className="text-xs text-red-600">This email is already in use.</span>
            </div>

            {/* Disabled Input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Disabled Input</label>
              <input 
                type="text" 
                disabled 
                placeholder="Cannot edit this" 
                className="border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>
        </section>

        {/* 4. Alerts & Badges */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold font-manrope border-b border-gray-300 pb-2">4. Alerts & States</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
            
            <div className="text-red-600 bg-red-100 border border-red-400 font-medium py-3 px-4 rounded-md text-sm md:text-base">
              <strong>Error:</strong> Failed to join the event. Please try again.
            </div>

            <div className="text-yellow-600 bg-yellow-100 border border-yellow-400 font-medium py-3 px-4 rounded-md text-sm md:text-base">
              <strong>Warning:</strong> Your organization profile is incomplete.
            </div>

            <div className="text-green-600 bg-green-100 border border-green-400 font-medium py-3 px-4 rounded-md text-sm md:text-base">
              <strong>Success:</strong> Post published successfully!
            </div>
          </div>
        </section>

        {/* 5. Skeleton Loader Demo */}
        <section className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold font-manrope border-b border-gray-300 pb-2">5. Loading States (Skeleton)</h2>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 w-full md:w-2/3">
            <div className="flex items-center space-x-4 animate-pulse mb-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default DesignSystem;