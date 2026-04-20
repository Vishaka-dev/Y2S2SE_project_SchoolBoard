import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpenText, Filter, Loader2, Plus, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import resourceHubService from '../services/resourceHubService';
import ResourceUploadModal from '../components/resource-hub/ResourceUploadModal';
import ResourceCard from '../components/resource-hub/ResourceCard';
import ShareModal from '../components/ShareModal';

const RESOURCE_CATEGORIES = [
  'STEM',
  'BUSINESS',
  'ARTS',
  'SOCIAL_SCIENCE',
  'TECHNOLOGY',
  'LANGUAGE',
  'HEALTH',
  'EDUCATION',
];

const RESOURCE_TYPES = ['DOCUMENT', 'LINK', 'IMAGE', 'PRESENTATION'];
const USER_ROLES = ['SCHOOL_STUDENT', 'UNIVERSITY_STUDENT', 'STUDENT', 'TEACHER', 'INSTITUTE', 'ADMIN'];
const PAGE_SIZE = 10;

const initialForm = {
  title: '',
  description: '',
  category: 'STEM',
  type: 'DOCUMENT',
  externalUrl: '',
  tagsInput: '',
};

const extractErrorMessage = (error) => {
  if (!error) return 'Something went wrong.';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return 'Something went wrong.';
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeRoleLabel = (role) => {
  if (!role) return 'User';
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const prettyLabel = (value) => value.toLowerCase().split('_').join(' ');

const ResourceHub = () => {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Sharing state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState(null);

  const handleShareClick = (resource) => {
    setShareContent(resource);
    setIsShareModalOpen(true);
  };

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    role: '',
  });

  const fileInputRef = useRef(null);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((value) => typeof value === 'string' && value.trim() !== '').length,
    [filters]
  );

  const loadResources = async (pageToLoad = 0, append = false, explicitFilters = filters) => {
    if (append) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
      setFetchError('');
    }

    try {
      const response = await resourceHubService.getResources({
        page: pageToLoad,
        size: PAGE_SIZE,
        search: explicitFilters.search,
        category: explicitFilters.category,
        type: explicitFilters.type,
        role: explicitFilters.role,
      });

      const nextResources = response?.resources || [];

      setResources((previous) => (append ? [...previous, ...nextResources] : nextResources));
      setPage(response?.page ?? pageToLoad);
      setHasMore(Boolean(response?.hasNext));
    } catch (error) {
      setFetchError(extractErrorMessage(error));
      if (!append) {
        setResources([]);
      }
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadResources(0, false, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFeedback = () => {
    if (formError) setFormError('');
    if (formSuccess) setFormSuccess('');
  };

  const handleFormChange = (field) => (event) => {
    resetFeedback();
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleTypeChange = (event) => {
    const nextType = event.target.value;
    resetFeedback();

    setForm((previous) => ({
      ...previous,
      type: nextType,
      externalUrl: nextType === 'LINK' ? previous.externalUrl : '',
    }));

    if (nextType === 'LINK') {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (event) => {
    resetFeedback();
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('File size must be 10MB or less.');
      setSelectedFile(null);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    if (form.type === 'LINK') {
      setForm((previous) => ({
        ...previous,
        type: 'DOCUMENT',
      }));
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return 'Title is required.';
    }

    const hasFile = Boolean(selectedFile);
    const hasExternalUrl = Boolean(form.externalUrl.trim());

    if (hasFile === hasExternalUrl) {
      return 'Provide either a file or an external URL.';
    }

    if (form.type === 'LINK' && !hasExternalUrl) {
      return 'Type LINK requires an external URL.';
    }

    if (hasExternalUrl && form.type !== 'LINK') {
      return 'External URL is only allowed when type is LINK.';
    }

    if (hasFile && form.type === 'LINK') {
      return 'Type LINK does not allow file uploads.';
    }

    return '';
  };

  const parseTags = () =>
    form.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

  const resetUploadForm = () => {
    setForm(initialForm);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    resetFeedback();

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await resourceHubService.createResource({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.type,
        file: selectedFile,
        externalUrl: form.externalUrl.trim(),
        tags: parseTags(),
      });

      setFormSuccess('Resource uploaded successfully.');
      resetUploadForm();
      setIsUploadModalOpen(false);
      await loadResources(0, false, filters);
    } catch (error) {
      setFormError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const handleApplyFilters = () => {
    loadResources(0, false, filters);
  };

  const handleResetFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      type: '',
      role: '',
    };

    setFilters(clearedFilters);
    loadResources(0, false, clearedFilters);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    loadResources(nextPage, true, filters);
  };

  const handleDelete = async (resourceId) => {
    const shouldDelete = window.confirm('Delete this resource? This action will hide it from the list.');
    if (!shouldDelete) {
      return;
    }

    setDeleteTarget(resourceId);

    try {
      await resourceHubService.deleteResource(resourceId);
      setResources((previous) => previous.filter((resource) => resource.id !== resourceId));
      setFormSuccess('Resource deleted successfully.');
    } catch (error) {
      setFormError(extractErrorMessage(error));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <section className="bg-white rounded-lg shadow-md border border-gray-100 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold font-manrope text-gray-900">Resource Hub</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2 font-dm-sans max-w-2xl">
              Upload and discover academic resources by category, type, and role. Share documents, links, images,
              and presentations with the LearnLink community.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-2 text-xs md:text-sm font-medium">
              {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
            </div>
            <button
              type="button"
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setIsUploadModalOpen(true);
              }}
              className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload New Resource
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md border border-gray-100 p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg md:text-xl font-semibold font-manrope text-gray-900">Search & Filters</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by title</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={handleFilterChange('search')}
                placeholder="Search by title"
                className="w-full bg-white border border-gray-300 rounded-md py-2.5 pl-9 pr-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={handleFilterChange('category')}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All categories</option>
              {RESOURCE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {prettyLabel(category)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={handleFilterChange('type')}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {prettyLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uploader Role</label>
            <select
              value={filters.role}
              onChange={handleFilterChange('role')}
              className="w-full bg-white border border-gray-300 rounded-md py-2.5 px-3 text-sm md:text-base text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All roles</option>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {normalizeRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2.5 text-sm"
          >
            Reset
          </button>
        </div>
      </section>

      {formSuccess && (
        <div className="bg-green-100 text-green-700 border border-green-300 font-medium rounded-md px-3 py-2 text-sm">
          {formSuccess}
        </div>
      )}

      {formError && (
        <div className="bg-red-100 text-red-700 border border-red-300 font-medium rounded-md px-3 py-2 text-sm">
          {formError}
        </div>
      )}

      <section className="space-y-4 md:space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="animate-pulse bg-gray-200 rounded-xl h-64" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 text-center">
            <p className="bg-red-100 text-red-600 border border-red-400 font-medium rounded-md px-3 py-2 text-sm inline-block">
              {fetchError}
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => loadResources(0, false, filters)}
                className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 px-4 py-2 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <BookOpenText className="w-7 h-7" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold font-manrope text-gray-900">No resources found</h3>
            <p className="text-sm md:text-base text-gray-500 mt-2 font-dm-sans">
              Try changing filters or upload the first resource for this topic.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  user={user}
                  deleteTarget={deleteTarget}
                  onDelete={handleDelete}
                  prettyLabel={prettyLabel}
                  normalizeRoleLabel={normalizeRoleLabel}
                  formatDate={formatDate}
                  onShare={() => handleShareClick(resource)}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm inline-flex items-center gap-2"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Resources'
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center text-xs md:text-sm text-gray-500 py-2">You have reached the end of resources.</div>
            )}
          </>
        )}
      </section>

      <ResourceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        form={form}
        selectedFile={selectedFile}
        fileInputRef={fileInputRef}
        isSubmitting={isSubmitting}
        formError={formError}
        onSubmit={handleUploadSubmit}
        onFormChange={handleFormChange}
        onTypeChange={handleTypeChange}
        onFileChange={handleFileChange}
        categories={RESOURCE_CATEGORIES}
        types={RESOURCE_TYPES}
        prettyLabel={prettyLabel}
      />
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        content={shareContent}
        contentType="RESOURCE"
      />
    </div>
  );
};

export default ResourceHub;
