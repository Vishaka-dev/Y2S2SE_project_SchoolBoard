import React, { useState } from 'react';

const REACTION_OPTIONS = [
  { type: 'LIKE', emoji: '👍', label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { type: 'INSIGHTFUL', emoji: '💡', label: 'Insightful', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { type: 'HELPFUL', emoji: '📚', label: 'Helpful', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { type: 'THANKS', emoji: '🙏', label: 'Thanks', color: 'text-green-600', bgColor: 'bg-green-50' },
  { type: 'CELEBRATE', emoji: '🎉', label: 'Celebrate', color: 'text-red-500', bgColor: 'bg-red-50' },
  { type: 'PERFECT', emoji: '💯', label: 'Perfect', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  { type: 'FUNNY', emoji: '😂', label: 'Funny', color: 'text-orange-500', bgColor: 'bg-orange-50' }
];

const ReactionButton = ({ currentUserReaction, onReact }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => {
      setIsHovered(true);
    }, 300); // Small delay to avoid accidental triggers
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    // Add a slight delay before hiding so user can move mouse to the picker
    setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleReactionClick = (type, e) => {
    e.stopPropagation();
    setIsHovered(false);
    if (hoverTimeout) clearTimeout(hoverTimeout);
    onReact(type);
  };

  const handleDefaultClick = (e) => {
    e.stopPropagation();
    // If already reacted, toggle it off by sending the same reaction type, 
    // or if none, send default LIKE.
    const reactionType = currentUserReaction || 'LIKE';
    onReact(reactionType);
  };

  const currentOption = REACTION_OPTIONS.find(opt => opt.type === currentUserReaction);

  return (
    <div 
      className="relative flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Reaction Picker Popup */}
      {isHovered && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-100 p-1 flex gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {REACTION_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={(e) => handleReactionClick(option.type, e)}
              className="w-10 h-10 flex items-center justify-center text-xl hover:scale-125 hover:-translate-y-2 transition-transform duration-200 bg-transparent rounded-full hover:bg-gray-50 focus:outline-none"
              title={option.label}
            >
              {option.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button 
        onClick={handleDefaultClick}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition group/btn font-bold text-sm
          ${currentOption ? `${currentOption.color} ${currentOption.bgColor}` : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
      >
        <span className="text-lg group-hover/btn:scale-110 transition-transform">
          {currentOption ? currentOption.emoji : '👍'}
        </span>
        <span>{currentOption ? currentOption.label : 'Like'}</span>
      </button>
    </div>
  );
};

export default ReactionButton;
