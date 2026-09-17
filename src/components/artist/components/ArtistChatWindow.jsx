import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Send, 
  MoreVertical, 
  Smile, 
  User as UserIcon,
  ChevronLeft,
  CheckCheck
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { messagesAPI } from '../services/api';

// In Webpack/Create React App, use process.env
const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://sverxiioo.nanoprofiles.com';

const ArtistChatWindow = ({ currentUser, partnerId, partnerName, partnerImage, partnerEmail, onBack, onNewMessage }) => {
  const isBroadcast = partnerEmail === 'artartistofficial@gmail.com' || 
                      partnerEmail === 'artartistdata@gmail.com' || 
                      partnerName === 'ArtArtist' || 
                      partnerName === 'Art Artist';

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
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    setSocket(newSocket);
    setupSocket(newSocket);

    // Fetch history
    const fetchHistory = async () => {
      setLoading(true);
      try {
        console.log(`[DEBUG] Artist ChatWindow Fetching history for partner: ${partnerId}`);
        const data = await messagesAPI.getConversationHistory(partnerId);
        console.log(`[DEBUG] Artist ChatWindow Received ${data?.length || 0} messages`);
        if (Array.isArray(data)) setMessages(data);
      } catch (err) {
        console.error('Artist fetch history error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    return () => newSocket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
    const myId = currentUser?._id || currentUser?.id;
    const pId = partnerId;
    
    if (!newMessage.trim() || !myId || !pId) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      // 1. Send via REST API
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
    <div className="flex flex-col h-full bg-[#0b141a] text-white overflow-hidden rounded-xl border border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 hover:bg-gray-700 rounded-full md:hidden">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="relative">
            {partnerImage ? (
              <img src={partnerImage} alt={partnerName} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <UserIcon size={20} />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#202c33] rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-gray-100">{isBroadcast ? 'ArtArtist' : (partnerName || 'Collector')}</h3>
              {isBroadcast && (
                <svg className="w-4 h-4 fill-[#0095f6] flex-shrink-0" viewBox="0 0 24 24" aria-label="Verified account">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.512 1.5 12 1.5s-2.77 1.015-3.412 2.285C8.171 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.412 5.28 3.412 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275C9.23 21.485 10.488 22.5 12 22.5s2.77-1.015 3.412-2.285c.418.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.43l-4.24-4.24 1.41-1.41 2.83 2.82 7.07-7.07 1.41 1.41-8.48 8.49z"></path>
                </svg>
              )}
              <div className={`w-1.5 h-1.5 rounded-full ${socket?.connected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
            </div>
            <p className="text-[10px] text-gray-400">
              {partnerTyping ? (
                <span className="text-green-400 animate-pulse font-medium uppercase tracking-widest text-[9px]">Typing...</span>
              ) : (
                'Online'
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-400">
          <MoreVertical size={20} className="cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b141a]"
        style={{ 
          backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-whatsapp-dark-background-w-whatsapp-dark-pattern.jpg")',
          backgroundSize: '400px',
          backgroundBlendMode: 'overlay'
        }}
      >
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
                className={`max-w-[75%] rounded-lg px-3 py-2 shadow-md relative group transition-all duration-300 transform hover:scale-[1.01] ${
                  isMe 
                    ? 'bg-[#005c4b] text-gray-100 rounded-tr-none' 
                    : 'bg-[#202c33] text-gray-100 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-gray-400">
                    {msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : ''}
                  </span>
                  {isMe && (
                    <span className="text-blue-400">
                      <CheckCheck size={12} />
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {partnerTyping && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] rounded-lg px-4 py-2 rounded-tl-none shadow-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isBroadcast ? (
        <div className="p-4 bg-[#202c33] text-center border-t border-gray-700 text-xs font-semibold text-gray-400 select-none flex items-center justify-center gap-2">
          <span>📢 This is a one-way announcement broadcast. You cannot reply to this channel.</span>
        </div>
      ) : (
        <div className="p-3 bg-[#202c33] flex items-center gap-3 relative">
          <div className="flex items-center gap-3 text-gray-400 px-1">
            <div className="relative">
              <Smile 
                size={24} 
                className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-emerald-500' : 'hover:text-white'}`}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              />
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-[100] shadow-2xl">
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
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
              className="w-full bg-[#2a3942] text-gray-100 py-2 px-4 rounded-xl focus:outline-none border border-transparent focus:border-gray-600 transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-all ${
              newMessage.trim() 
                ? 'bg-[#00a884] text-white scale-110 shadow-lg' 
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistChatWindow;
