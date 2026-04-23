import { Download, ExternalLink, Trash2, MoreVertical, Share2 } from 'lucide-react';

const ResourceCard = ({
  resource,
  user,
  deleteTarget,
  onDelete,
  prettyLabel,
  normalizeRoleLabel,
  formatDate,
  onShare,
}) => {
  const isOwner = user?.id && resource.uploadedBy?.id === user.id;

  return (
    <article className="h-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 transition-colors duration-200 hover:border-blue-200 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base md:text-lg font-semibold font-manrope text-gray-900 leading-snug">
          {resource.title}
        </h3>

        {isOwner && (
          <div className="relative group/menu">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20">
              <div className="bg-white border border-gray-100 shadow-xl rounded-xl min-w-[140px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => onDelete(resource.id)}
                  disabled={deleteTarget === resource.id}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  {deleteTarget === resource.id ? '...' : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl shadow-sm transition-all duration-200 px-4 py-2 text-xs inline-flex items-center justify-center gap-2 group/btn"
          >
            <Download className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            Download
          </a>
        )}

        {resource.externalUrl && (
          <a
            href={resource.externalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 font-bold rounded-xl shadow-sm transition-all duration-200 px-4 py-2 text-xs inline-flex items-center justify-center gap-2 group/btn"
          >
            <ExternalLink className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
            Visit Link
          </a>
        )}

        <button 
          onClick={onShare}
          className="flex-1 bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 font-bold rounded-xl shadow-sm transition-all duration-200 px-4 py-2 text-xs inline-flex items-center justify-center gap-2 group/btn"
        >
          <Share2 className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
          Share
        </button>
      </div>
    </article>
  );
};

export default ResourceCard;
