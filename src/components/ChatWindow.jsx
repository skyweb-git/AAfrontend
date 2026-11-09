import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  MoreVertical,
  Smile,
  CheckCheck,
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { format } from 'date-fns';
import { messagesAPI } from '../services/api';

// Robust Socket URL resolution (matches api.js logic)
const resolveSocketUrl = () => {
  // Priority 1: Environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
  }

  // Priority 2: New Production URL
  return 'https://sverxiioo.nanoprofiles.com';
};

const SOCKET_URL = resolveSocketUrl();

const ADMIN_IDS = new Set(['6a01d63b3d04d8fc5ee912b2']);
const ADMIN_EMAILS = new Set([
  'artartistofficial@gmail.com',
  'artartistdata@gmail.com'
]);

const isSameIdentity = (msg, currentUser) => {
  const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const currentUserUserId = currentUser?.userId?.toString();

  return (
    msgSenderId === currentUserId ||
    (currentUserUserId && msgSenderId === currentUserUserId) ||
    (msg.sender?.email &&
      currentUser?.email &&
      msg.sender.email.toLowerCase() === currentUser.email.toLowerCase())
  );
};

const getEmojiPickerWidth = () => {
  if (typeof window === 'undefined') return 300;
  return Math.min(300, window.innerWidth - 32);
};

const ChatWindow = ({
  currentUser,
  partnerId,
  partnerName,
  partnerImage,
  partnerEmail,
  partnerRole,
  socket: sharedSocket,
  onBack,
  onNewMessage
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localSocket, setLocalSocket] = useState(null);
  const [emojiWidth, setEmojiWidth] = useState(getEmojiPickerWidth);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const socket = sharedSocket || localSocket;

  // If partner is Uday / Admin founder, map display details
  const isUdayAdmin =
    ADMIN_IDS.has(partnerId?.toString()) ||
    ADMIN_EMAILS.has(partnerEmail?.toLowerCase());

  const displayName = isUdayAdmin ? 'uday(the founder of artartist)' : (partnerName || 'Chat Partner');
  const displayImage = isUdayAdmin ? '/uday_dp.jpeg' : partnerImage;

  // Broadcast / Admin channel — explicit admin ids/emails/role only
  const isBroadcast =
    isUdayAdmin ||
    partnerRole === 'admin' ||
    ADMIN_EMAILS.has(partnerEmail?.toLowerCase());

  // Navigate to profile on avatar/name click
  const handleProfileClick = () => {
    if (isUdayAdmin) {
      navigate('/artist/6a11b59b27da027495f549eb');
    } else if (partnerId) {
      navigate(`/artist/${partnerId}`);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    const onResize = () => setEmojiWidth(getEmojiPickerWidth());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getConversationId = () => {
    const myId = currentUser?._id || currentUser?.id;
    const myEmail = currentUser?.email;
    const pEmail = partnerEmail;
    if (myEmail && pEmail) {
      return [myEmail.toLowerCase(), pEmail.toLowerCase()].sort().join('_');
    }
    return [myId?.toString(), partnerId?.toString()].sort().join('_');
  };

  // Initialize Socket and Fetch History
  useEffect(() => {
    // Only require currentUser and partnerId
    if (!currentUser || !partnerId) {
      setLoading(false);
      return;
    }

    const setupListeners = (socketInstance) => {
      const onConnect = () => {
        const myId = currentUser?._id || currentUser?.id;
        socketInstance.emit('join_conversation', `user_${myId}`);
        socketInstance.emit('join_conversation', getConversationId());
      };

      const onReceive = (msg) => {
        if (!isSameIdentity(msg, currentUser)) {
          setMessages((prev) => {
            const isDuplicate = prev.some(m => m._id === msg._id || (m.text === msg.text && Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000));
            if (isDuplicate) return prev;
            return [...prev, msg];
          });
          if (onNewMessageRef.current) onNewMessageRef.current(msg);
        }
      };

      const onTyping = ({ senderId }) => {
        if (senderId?.toString() === partnerId?.toString()) setPartnerTyping(true);
      };

      const onStopTyping = ({ senderId }) => {
        if (senderId?.toString() === partnerId?.toString()) setPartnerTyping(false);
      };

      if (socketInstance.connected) onConnect();
      socketInstance.on('connect', onConnect);
      socketInstance.on('receive_message', onReceive);
      socketInstance.on('user_typing', onTyping);
      socketInstance.on('user_stop_typing', onStopTyping);

      return () => {
        socketInstance.off('connect', onConnect);
        socketInstance.off('receive_message', onReceive);
        socketInstance.off('user_typing', onTyping);
        socketInstance.off('user_stop_typing', onStopTyping);
      };
    };

    let cleanupListeners = () => {};
    let ownedSocket = null;

    if (sharedSocket) {
      cleanupListeners = setupListeners(sharedSocket) || (() => {});
    } else {
      ownedSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000
      });
      setLocalSocket(ownedSocket);
      cleanupListeners = setupListeners(ownedSocket) || (() => {});
    }

    // Fetch history
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await messagesAPI.getConversationHistory(partnerId);

        let messagesData = response;
        if (response && response.data && Array.isArray(response.data)) {
          messagesData = response.data;
        }

        if (Array.isArray(messagesData)) {
          setMessages(messagesData);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    return () => {
      cleanupListeners();
      if (ownedSocket) {
        ownedSocket.disconnect();
        setLocalSocket(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, currentUser?.id, partnerId, partnerEmail, sharedSocket]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
    if (isBroadcast) return; // Disallow replying to broadcasts
    const myId = currentUser?._id || currentUser?.id;
    const pId = partnerId;

    if (!newMessage.trim() || !myId || !pId) return;

    const text = newMessage.trim();
    setNewMessage(''); // Clear immediately for UX

    try {
      // 1. Send via REST API
      const sentMsg = await messagesAPI.sendMessage({
        recipientId: pId,
        text: text
      });

      // 2. Add to local state
      setMessages((prev) => [...prev, sentMsg]);
      if (onNewMessageRef.current) onNewMessageRef.current(sentMsg);

      // 3. Stop typing via socket
      if (socket?.connected) {
        socket.emit('stop_typing', { conversationId: getConversationId(), senderId: myId });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTyping = (e) => {
    if (isBroadcast) return;
    setNewMessage(e.target.value);

    const myId = currentUser?._id || currentUser?.id;
    const pId = partnerId;
    if (!myId || !pId || !socket?.connected) return;

    try {
      const conversationId = getConversationId();

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
          
          {/* Avatar — clickable to redirect to profile */}
          <div 
            onClick={handleProfileClick}
            className="relative cursor-pointer group"
            title="Click to view profile"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 shadow-2xs transition-transform group-hover:scale-105">
              {displayImage ? (
                <img src={displayImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white font-bold uppercase text-sm">
                  {(displayName || 'A')[0]}
                </div>
              )}
            </div>
            {!isBroadcast && (
              <div
                title={socket?.connected ? 'Connected' : 'Disconnected (Click to retry)'}
                onClick={(e) => {
                  e.stopPropagation();
                  !socket?.connected && window.location.reload();
                }}
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white cursor-pointer ${
                  socket?.connected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-red-500'
                }`}
              ></div>
            )}
          </div>

          {/* Name & status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 
                onClick={handleProfileClick}
                className="font-bold text-sm text-gray-900 cursor-pointer hover:text-red-600 hover:underline transition-colors"
                title="Click to view profile"
              >
                {displayName}
              </h3>
              {isBroadcast && (
                <svg className="w-4 h-4 fill-[#0095f6] flex-shrink-0" viewBox="0 0 24 24" aria-label="Verified account">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.512 1.5 12 1.5s-2.77 1.015-3.412 2.285C8.171 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.412 5.28 3.412 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275C9.23 21.485 10.488 22.5 12 22.5s2.77-1.015 3.412-2.285c.418.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.43l-4.24-4.24 1.41-1.41 2.83 2.82 7.07-7.07 1.41 1.41-8.48 8.49z"></path>
                </svg>
              )}
            </div>
            <p className="text-[10px]">
              {isBroadcast ? (
                <span className="text-gray-500 font-medium">Official Channel • Broadcast Only</span>
              ) : partnerTyping ? (
                <span className="text-red-500 animate-pulse font-semibold uppercase tracking-wider text-[9px]">Typing...</span>
              ) : (
                <span className={socket?.connected ? 'text-emerald-600 font-medium flex items-center gap-1' : 'text-gray-400'}>
                  {socket?.connected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  )}
                  {socket?.connected ? 'Online' : 'Offline'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-gray-400">
          <button 
            onClick={handleProfileClick}
            className="text-xs px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-red-600 border border-gray-200 rounded-lg transition-colors font-medium hidden sm:inline-flex items-center gap-1 shadow-2xs"
            title="View Profile"
          >
            <span>View Profile</span>
          </button>
          <MoreVertical size={18} className="cursor-pointer hover:text-gray-700 transition-colors" />
        </div>
      </div>

      {/* Chat Background / Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#f8f9fa] custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs font-medium">Loading chat...</p>
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-60">
                <div className="p-4 bg-white border border-gray-200 rounded-full shadow-2xs">
                  <UserIcon size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm font-medium">No messages yet.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = isSameIdentity(msg, currentUser);

                return (
                  <div key={msg._id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xs relative group transition-all duration-200 ${
                        isMe
                          ? 'bg-red-600 text-white rounded-br-xs'
                          : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-1.5">
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
              })
            )}
            {partnerTyping && !isBroadcast && (
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
          </>
        )}
      </div>

      {/* Input Area / Broadcast Notice */}
      {isBroadcast ? (
        <div className="p-4 bg-gray-50 text-center border-t border-gray-200 select-none flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 shadow-2xs">
            <span>📢</span>
            <span>This is an official announcement broadcast. Replies are disabled.</span>
          </div>
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
                <div
                  className="absolute bottom-12 left-0 z-[100] shadow-xl border border-gray-200 rounded-2xl overflow-hidden"
                  style={{ width: emojiWidth, maxWidth: 'min(300px, calc(100vw - 2rem))' }}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme="light"
                    searchDisabled
                    skinTonesDisabled
                    width={emojiWidth}
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
              placeholder="Type a message..."
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

export default ChatWindow;
