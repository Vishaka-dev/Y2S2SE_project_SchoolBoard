import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Users, Loader2, Share2, CheckCircle2 } from 'lucide-react';
import groupService from '../services/groupService';
import { postService } from '../services/postService';

const ShareModal = ({ isOpen, onClose, content, contentType = 'POST' }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingGroupId, setSharingGroupId] = useState(null);
  const [sharedGroups, setSharedGroups] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupService.getMyGroups();
      setGroups(data);
    } catch (err) {
      console.error('Failed to fetch groups for sharing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (groupId) => {
    setSharingGroupId(groupId);
    try {
      const shareText = contentType === 'RESOURCE' 
        ? `[RES_SHARE]${JSON.stringify({
            id: content.id,
            title: content.title,
            category: content.category,
            type: content.type,
            fileUrl: content.fileUrl,
            externalUrl: content.externalUrl,
            description: content.description,
            uploadedBy: content.uploadedBy,
            tags: content.tags,
            createdAt: content.createdAt
          })}`
        : `Shared a post: "${content.title || content.content?.substring(0, 50)}..."`;
      
      await postService.createPost({
        content: shareText,
        groupId: groupId
      });
      
      setSharedGroups(prev => new Set([...prev, groupId]));
    } catch (err) {
      console.error('Failed to share:', err);
    } finally {
      setSharingGroupId(null);
    }
  };

  if (!isOpen) return null;

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}>
      
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share to Group</h2>
              <p className="text-xs text-gray-500 font-medium">Post this {contentType.toLowerCase()} to a community</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search your groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm font-medium">Loading your groups...</p>
              </div>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div 
                  key={group.id} 
                  className="group flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{group.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{group.groupType}</p>
                    </div>
                  </div>
                  
                  {sharedGroups.has(group.id) ? (
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Shared
                    </div>
                  ) : (
                    <button
                      onClick={() => handleShare(group.id)}
                      disabled={sharingGroupId === group.id}
                      className="px-4 py-1.5 bg-white text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-full text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {sharingGroupId === group.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : 'Share Now'}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-400 font-medium">No groups found</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            Sharing helps spread knowledge across the SchoolBoard community.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
