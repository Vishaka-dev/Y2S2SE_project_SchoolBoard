import { Loader2, UploadCloud, X } from 'lucide-react';

const ResourceUploadModal = ({
  isOpen,
  onClose,
  form,
  selectedFile,
  fileInputRef,
  isSubmitting,
  formError,
  onSubmit,
  onFormChange,
  onTypeChange,
  onFileChange,
  categories,
  types,
  prettyLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-4 md:p-6 flex items-center justify-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold font-manrope text-gray-900">Upload New Resource</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
            disabled={isSubmitting}
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={onFormChange('title')}
                placeholder="Enter resource title"
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={onFormChange('category')}
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {prettyLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={onTypeChange}
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {prettyLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'LINK' ? 'External URL' : 'File'}
              </label>

              {form.type === 'LINK' ? (
                <input
                  type="url"
                  value={form.externalUrl}
                  onChange={onFormChange('externalUrl')}
                  placeholder="https://example.com/resource"
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={onFileChange}
                  className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              <p className="mt-1 text-xs md:text-sm text-gray-500">Maximum file size: 10MB.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={onFormChange('description')}
              placeholder="Add a brief description to help others understand this resource"
              rows={3}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={5000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={onFormChange('tagsInput')}
              placeholder="math, exam prep, tutorial"
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {selectedFile && form.type !== 'LINK' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
              Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {formError && (
            <div className="bg-red-100 text-red-600 border border-red-400 font-medium rounded-md px-3 py-2 text-sm">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2 text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 px-5 py-2.5 text-sm md:text-base inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
