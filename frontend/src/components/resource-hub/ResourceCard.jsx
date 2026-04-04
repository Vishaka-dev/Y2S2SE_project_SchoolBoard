import { Download, ExternalLink, Trash2 } from 'lucide-react';

const ResourceCard = ({
  resource,
  user,
  deleteTarget,
  onDelete,
  prettyLabel,
  normalizeRoleLabel,
  formatDate,
}) => {
  const isOwner = user?.id && resource.uploadedBy?.id === user.id;

  return (
    <article className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 transition-colors duration-200 hover:border-blue-200 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base md:text-lg font-semibold font-manrope text-gray-900 leading-snug">
          {resource.title}
        </h3>

        {isOwner && (
          <button
            type="button"
            onClick={() => onDelete(resource.id)}
            disabled={deleteTarget === resource.id}
            className="shrink-0 bg-red-600 text-white border border-red-600 hover:bg-red-700 font-medium rounded-md shadow-sm transition-colors duration-200 px-2.5 py-1.5 text-xs disabled:opacity-50"
          >
            {deleteTarget === resource.id ? 'Deleting...' : (
              <span className="inline-flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </span>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Uploaded by <span className="font-medium text-gray-700">{resource.uploadedBy?.username || 'Unknown'}</span>
        {' '}({normalizeRoleLabel(resource.uploadedBy?.role)})
        {' '}on {formatDate(resource.createdAt)}
      </p>

      {resource.description && (
        <p className="text-sm text-gray-700 mt-3 font-dm-sans [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
          {prettyLabel(resource.category)}
        </span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 uppercase tracking-wide">
          {prettyLabel(resource.type)}
        </span>
      </div>

      {Array.isArray(resource.tags) && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {resource.tags.slice(0, 4).map((tag) => (
            <span key={`${resource.id}-${tag}`} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
              #{tag}
            </span>
          ))}
          {resource.tags.length > 4 && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">
              +{resource.tags.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2.5">
        {resource.fileUrl && (
          <a
            href={resource.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors duration-200 px-3 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Open File
          </a>
        )}

        {resource.externalUrl && (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-medium rounded-lg shadow-sm transition-colors duration-200 px-3 py-2 text-xs inline-flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Visit Link
          </a>
        )}
      </div>
    </article>
  );
};

export default ResourceCard;
