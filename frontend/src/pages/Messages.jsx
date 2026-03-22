import { MessageSquare, Search, Send } from 'lucide-react';
import { useState } from 'react';

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  // Mock data
  const conversations = [
    { id: 1, name: 'Dr. Sarah Wilson', role: 'Mathematics Teacher', lastMessage: 'Thanks for your question!', time: '2h ago', unread: 2, avatar: null },
    { id: 2, name: 'Alex Chen', role: 'Computer Science Student', lastMessage: 'Let\'s work on the project together', time: '5h ago', unread: 0, avatar: null },
    { id: 3, name: 'Prof. James Brown', role: 'Physics Teacher', lastMessage: 'Class starts at 2 PM', time: '1d ago', unread: 0, avatar: null },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Messages
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                  selectedChat?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {conversation.avatar ? (
                      <img src={conversation.avatar} alt={conversation.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm">{getInitials(conversation.name)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    <span className="text-sm">{getInitials(selectedChat.name)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                    <p className="text-xs text-gray-500">{selectedChat.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
                      <p className="text-gray-800 text-sm">Hi! Do you have a moment to discuss the assignment?</p>
                      <span className="text-xs text-gray-500 mt-1 block">10:30 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-md">
                      <p className="text-sm">Of course! What do you need help with?</p>
                      <span className="text-xs text-blue-100 mt-1 block">10:32 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
