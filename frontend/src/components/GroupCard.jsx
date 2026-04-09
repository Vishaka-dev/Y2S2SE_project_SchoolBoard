import { BookOpen, Lock, Users, Globe2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatGroupType = (groupType) =>
  groupType
    ?.split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ') || 'Group';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();

  if (!group) {
    return null;
  }

  const visibilityLabel = group.visibility === 'PRIVATE' ? 'Private' : 'Public';

  return (
    <button
      type="button"
      onClick={() => navigate(`/groups/${group.id}`)}
      className="w-full rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            {group.imageUrl ? (
              <img
                src={group.imageUrl}
                alt={group.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <BookOpen className="h-6 w-6" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-bold text-gray-900">{group.name}</h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                {formatGroupType(group.groupType)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {group.subject} • {group.academicLevel}
            </p>
            {group.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">{group.description}</p>
            )}
          </div>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 flex-shrink-0 text-gray-300" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 font-medium">
          <Users className="h-3.5 w-3.5 text-blue-600" />
          {group.memberCount || 0} members
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 font-medium">
          {group.visibility === 'PRIVATE' ? (
            <Lock className="h-3.5 w-3.5 text-amber-600" />
          ) : (
            <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
          )}
          {visibilityLabel}
        </span>
        {group.joined && (
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
            Joined
          </span>
        )}
      </div>
    </button>
  );
};

export default GroupCard;
