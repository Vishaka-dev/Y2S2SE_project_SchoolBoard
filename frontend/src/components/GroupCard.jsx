import { Users, BookOpen, GraduationCap, Lightbulb, FlaskConical, Trophy, Heart, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GROUP_TYPE_CONFIG = {
  COURSE: { label: 'Course', icon: BookOpen, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  BATCH: { label: 'Batch', icon: GraduationCap, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  STUDY_GROUP: { label: 'Study Group', icon: Lightbulb, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  PROJECT: { label: 'Project', icon: Layers, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  EXAM_PREP: { label: 'Exam Prep', icon: FlaskConical, color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
  CLUB: { label: 'Club', icon: Trophy, color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100' },
  MENTORSHIP: { label: 'Mentorship', icon: Heart, color: 'from-pink-500 to-fuchsia-600', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100' },
};

const GroupCard = ({ group, onClick }) => {
  const navigate = useNavigate();
  const config = GROUP_TYPE_CONFIG[group.groupType] || GROUP_TYPE_CONFIG.COURSE;
  const Icon = config.icon;
  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const serverUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/api\/?$/, '');
    return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/groups/${group.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer group overflow-hidden"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Gradient Header */}
      <div className={`h-20 bg-gradient-to-r ${config.color} relative`}>
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/20 to-transparent" />
        <div className="absolute -bottom-5 left-5">
          <div className={`w-12 h-12 rounded-xl ${config.bg} ${config.border} border-2 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-white`}>
            {group.imageUrl ? (
              <img src={resolveImageUrl(group.imageUrl)} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <Icon className={`w-6 h-6 ${config.text}`} />
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-8 pb-5 px-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {group.name}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${config.bg} ${config.text} flex-shrink-0`}>
            {config.label}
          </span>
        </div>

        {group.description && (
          <p className="text-sm text-gray-500 line-clamp-2 font-dm-sans mb-3 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 mb-3">
          {group.subject && (
            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 font-medium">
              📚 {group.subject}
            </span>
          )}
          {group.academicLevel && (
            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md border border-gray-100 font-medium">
              🎓 {group.academicLevel}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="w-3.5 h-3.5" />
            <span className="font-semibold">{group.memberCount}</span>
            <span>member{group.memberCount !== 1 ? 's' : ''}</span>
          </div>

          {group.currentUserRole && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              group.currentUserRole === 'OWNER'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : group.currentUserRole === 'ADMIN'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {group.currentUserRole}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { GROUP_TYPE_CONFIG };
export default GroupCard;
