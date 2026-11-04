import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, 
  MoreVertical, 
  Smile, 
  ChevronLeft,
  CheckCheck
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { messagesAPI } from '../services/api';

// In Webpack/Create React App, use process.env
const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://sverxiioo.nanoprofiles.com';

const ArtistChatWindow = ({ currentUser, partnerId, partnerName, partnerImage, partnerEmail, onBack, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  /* eslint-disable-next-line no-unused-vars */
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isBroadcast = 
    partnerEmail?.toLowerCase() === 'artartistofficial@gmail.com' || 
    partnerEmail?.toLowerCase() === 'artartistdata@gmail.com' || 
    partnerEmail?.toLowerCase().includes('admin') ||
    partnerName?.toLowerCase().includes('admin') ||
    partnerName?.toLowerCase().includes('artlove') ||
    partnerName?.toLowerCase().trim() === 'artartist' || 
    partnerName?.toLowerCase().trim() === 'art artist' ||
    messages.some(m => m.senderType === 'admin');

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Initialize Socket and Fetch History
  useEffect(() => {
    if (!currentUser?._id || !partnerId) {
      setLoading(false);
      return;
    }

    const setupSocket = (socketInstance) => {
      socketInstance.on('connect', () => {
        console.log('✅ Artist Socket Connected:', socketInstance.id);
        const myId = currentUser?._id || currentUser?.id;
        const pId = partnerId;

        // Join individual user room for general notifications
        socketInstance.emit('join_conversation', `user_${myId}`);

        // Join specific conversation room (Prefer emails for stability across IDs)
        const myEmail = currentUser?.email;
        const pEmail = partnerEmail;

        let conversationId;
        if (myEmail && pEmail) {
          conversationId = [myEmail.toLowerCase(), pEmail.toLowerCase()].sort().join('_');
          console.log(`[SOCKET] Artist joining robust email-based room: ${conversationId}`);
        } else {
          conversationId = [myId?.toString(), pId?.toString()].sort().join('_');
          console.log(`[SOCKET] Artist joining ID-based room (email missing): ${conversationId}`);
        }
        
        socketInstance.emit('join_conversation', conversationId);
      });

      socketInstance.on('receive_message', (msg) => {
        console.log('📩 Artist Received Message:', msg);
        const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
        const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
        
        // Robust consolidated identity check via ID, User ID, email, or senderType matches
        const currentUserUserId = currentUser?.userId?.toString();
        const isMsgFromMe = msgSenderId === currentUserId || 
                            (currentUserUserId && msgSenderId === currentUserUserId) ||
                            (msg.sender?.email && currentUser?.email && msg.sender.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                            (msg.senderType === 'artist');
        
        if (!isMsgFromMe) {
          setMessages((prev) => {
            const isDuplicate = prev.some(m => m._id === msg._id || (m.text === msg.text && Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000));
            if (isDuplicate) return prev;
            return [...prev, msg];
          });
          if (onNewMessage) onNewMessage(msg);
        }
      });

      socketInstance.on('user_typing', ({ senderId }) => {
        if (senderId?.toString() === partnerId?.toString()) setPartnerTyping(true);
      });

      socketInstance.on('user_stop_typing', ({ senderId }) => {
        if (senderId?.toString() === partnerId?.toString()) setPartnerTyping(false);
      });
    };

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);
    setupSocket(newSocket);

    // Fetch message history
    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const history = await messagesAPI.getConversationHistory(partnerId);
        setMessages(Array.isArray(history) ? history : []);
      } catch (err) {
        console.error('Failed to fetch conversation history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    return () => newSocket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, partnerId, partnerEmail]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
    const myId = currentUser?._id || currentUser?.id;
    const pId = partnerId;
    if (!newMessage.trim() || !myId || !pId) return;

    const text = newMessage.trim();
    setNewMessage(''); // optimistic reset

    try {
      // 1. Send to server
      const sentMsg = await messagesAPI.sendMessage({
        recipientId: pId,
        text: text
      });

      // 2. Add to local state
      setMessages((prev) => [...prev, sentMsg]);
      if (onNewMessage) onNewMessage(sentMsg);
      
      // 3. Stop typing via socket
      if (socket?.connected) {
        const myEmail = currentUser?.email;
        const pEmail = partnerEmail;
        let conversationId;
        if (myEmail && pEmail) {
          conversationId = [myEmail.toLowerCase(), pEmail.toLowerCase()].sort().join('_');
        } else {
          conversationId = [myId.toString(), pId.toString()].sort().join('_');
        }
        socket.emit('stop_typing', { conversationId, senderId: myId });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const myId = currentUser?._id || currentUser?.id;
    const pId = partnerId;
    if (!myId || !pId || !socket?.connected) return;

    try {
      const myEmail = currentUser?.email;
      const pEmail = partnerEmail;
      let conversationId;
      if (myEmail && pEmail) {
        conversationId = [myEmail.toLowerCase(), pEmail.toLowerCase()].sort().join('_');
      } else {
        conversationId = [myId.toString(), pId.toString()].sort().join('_');
      }
      
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { conversationId, senderId: myId });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('stop_typing', { conversationId, senderId: myId });
      }, 2000);
    } catch (err) {
      console.error('Typing emission failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-full md:hidden transition-colors">
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="relative">
            {partnerImage ? (
              <img src={partnerImage} alt={partnerName} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-2xs" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold uppercase text-sm border border-gray-200">
                {(partnerName || 'C')[0]}
              </div>
            )}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${socket?.connected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-gray-900">{isBroadcast ? 'ArtArtist' : (partnerName || 'Collector')}</h3>
              {isBroadcast && (
                <svg className="w-4 h-4 fill-[#0095f6] flex-shrink-0" viewBox="0 0 24 24" aria-label="Verified account">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.512 1.5 12 1.5s-2.77 1.015-3.412 2.285C8.171 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.412 5.28 3.412 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275C9.23 21.485 10.488 22.5 12 22.5s2.77-1.015 3.412-2.285c.418.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.43l-4.24-4.24 1.41-1.41 2.83 2.82 7.07-7.07 1.41 1.41-8.48 8.49z"></path>
                </svg>
              )}
            </div>
            <p className="text-[10px]">
              {partnerTyping ? (
                <span className="text-red-500 animate-pulse font-semibold uppercase tracking-wider text-[9px]">Typing...</span>
              ) : (
                <span className={socket?.connected ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                  {socket?.connected ? 'Online' : 'Offline'}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-gray-400">
          <MoreVertical size={18} className="cursor-pointer hover:text-gray-700 transition-colors" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#f8f9fa] custom-scrollbar">
        {messages.map((msg, idx) => {
          const msgSenderId = msg.sender?._id || msg.sender;
          const currentUserId = currentUser?._id || currentUser?.id;
          
          // Robust consolidated identity check via ID, User ID, email, or senderType matches
          const currentUserUserId = currentUser?.userId?.toString();
          const isMe = msgSenderId?.toString() === currentUserId?.toString() ||
                       (currentUserUserId && msgSenderId?.toString() === currentUserUserId) ||
                       (msg.sender?.email && currentUser?.email && msg.sender.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                       (msg.senderType === 'artist');

          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs relative group transition-all duration-200 ${
                  isMe 
                    ? 'bg-red-600 text-white rounded-br-xs' 
                    : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  <span className={`text-[10px] ${isMe ? 'text-red-100 font-medium' : 'text-gray-400'}`}>
                    {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                  </span>
                  {isMe && (
                    <span className="text-white/90">
                      <CheckCheck size={13} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200/80 rounded-2xl px-4 py-3 rounded-bl-xs shadow-2xs">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isBroadcast ? (
        <div className="p-3.5 bg-gray-50 text-center border-t border-gray-200 text-xs font-semibold text-gray-500 select-none flex items-center justify-center gap-2">
          <span>📢 This is a one-way announcement broadcast. You cannot reply to this channel.</span>
        </div>
      ) : (
        <div className="p-3 md:p-4 bg-white border-t border-gray-200 flex items-center gap-2 md:gap-3 relative">
          <div className="flex items-center gap-2 text-gray-400 px-1">
            <div className="relative">
              <Smile 
                size={22} 
                className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-red-600' : 'hover:text-gray-600'}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-[100] shadow-xl border border-gray-200 rounded-2xl overflow-hidden">
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    theme="light"
                    searchDisabled
                    skinTonesDisabled
                    width={300}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your reply..."
              className="w-full bg-gray-100 hover:bg-gray-100/80 focus:bg-white text-gray-900 placeholder-gray-400 py-2.5 px-4 rounded-xl focus:outline-none border border-transparent focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              newMessage.trim() 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 active:scale-95' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistChatWindow;
