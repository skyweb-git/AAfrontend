import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
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

const ChatWindow = ({ currentUser, partnerId, partnerName, partnerImage, partnerEmail, onBack, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const onNewMessageRef = useRef(onNewMessage);
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  // Initialize Socket and Fetch History
  useEffect(() => {
    console.log('[DEBUG] ChatWindow useEffect triggered:', {
      currentUser: currentUser?._id,
      currentUserEmail: currentUser?.email,
      partnerId,
      partnerEmail,
      currentUserFull: currentUser,
      partnerIdFull: partnerId
    });

    // More permissive check - only require currentUser and partnerId
    if (!currentUser || !partnerId) {
      console.log('[DEBUG] ChatWindow early return - missing data:', {
        hasCurrentUser: !!currentUser,
        hasPartnerId: !!partnerId,
        currentUserKeys: currentUser ? Object.keys(currentUser) : [],
        currentUserType: typeof currentUser
      });
      setLoading(false);
      return;
    }

    const setupSocket = (socketInstance) => {
      socketInstance.on('connect', () => {
        console.log('✅ Chat Socket Connected:', socketInstance.id);
        const myId = currentUser?._id || currentUser?.id;
        const pId = partnerId;

        // Join individual user room for general notifications
        socketInstance.emit('join_conversation', `user_${myId}`);

        // Join specific conversation room (Prefer emails for stability across IDs)
        const myEmail = currentUser?.email;
        const pEmail = partnerEmail; // We should pass this prop

        let conversationId;
        if (myEmail && pEmail) {
          conversationId = [myEmail.toLowerCase(), pEmail.toLowerCase()].sort().join('_');
          console.log(`[SOCKET] Joining robust email-based room: ${conversationId}`);
        } else {
          conversationId = [myId?.toString(), pId?.toString()].sort().join('_');
          console.log(`[SOCKET] Joining ID-based room (email missing): ${conversationId}`);
        }

        socketInstance.emit('join_conversation', conversationId);
      });

      socketInstance.on('receive_message', (msg) => {
        console.log('📩 New Message Received via Socket:', msg);
        const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
        const currentUserId = (currentUser?._id || currentUser?.id)?.toString();

        // Robust consolidated identity check via ID, User ID, email, or senderType matches
        const currentUserUserId = currentUser?.userId?.toString();
        const isMsgFromMe = msgSenderId === currentUserId || 
                            (currentUserUserId && msgSenderId === currentUserUserId) ||
                            (msg.sender?.email && currentUser?.email && msg.sender.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                            (msg.senderType === 'user' && currentUser?.role === 'user');

        if (!isMsgFromMe) {
          setMessages((prev) => {
            // Robust duplicate check
            const isDuplicate = prev.some(m => m._id === msg._id || (m.text === msg.text && Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 2000));
            if (isDuplicate) return prev;
            return [...prev, msg];
          });
          if (onNewMessageRef.current) onNewMessageRef.current(msg);
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
        const myId = currentUser?._id || currentUser?.id || currentUser?.userId;
        console.log(`[DEBUG] ChatWindow Fetching history:`);
        console.log(`[DEBUG] - myId: ${myId}`);
        console.log(`[DEBUG] - partnerId: ${partnerId}`);
        console.log(`[DEBUG] - partnerId type: ${typeof partnerId}`);
        console.log(`[DEBUG] - currentUser:`, currentUser);
        console.log(`[DEBUG] - API call: messagesAPI.getConversationHistory(${partnerId})`);

        const response = await messagesAPI.getConversationHistory(partnerId);
        console.log(`[DEBUG] ChatWindow API Response:`);
        console.log(`[DEBUG] - Response type: ${typeof response}`);
        console.log(`[DEBUG] - Response:`, response);
        console.log(`[DEBUG] - Is Array: ${Array.isArray(response)}`);
        console.log(`[DEBUG] - Length: ${response?.length || 0}`);

        // Check if response has nested data
        let messagesData = response;
        if (response && response.data && Array.isArray(response.data)) {
          messagesData = response.data;
          console.log(`[DEBUG] Using response.data instead: ${messagesData.length} messages`);
        }

        if (Array.isArray(messagesData)) {
          console.log(`[DEBUG] Setting messages state with ${messagesData.length} messages`);
          setMessages(messagesData);
        } else {
          console.warn(`[DEBUG] Expected array but got: ${typeof messagesData}`, messagesData);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    return () => newSocket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id, currentUser?.id, partnerId, partnerEmail]); // Added missing dependencies

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleSend = async () => {
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
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-600">
              {partnerImage ? (
                <img src={partnerImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white font-bold uppercase">
                  {(partnerName || 'A')[0]}
                </div>
              )}
            </div>
            <div
              title={socket?.connected ? 'Connected' : 'Disconnected (Click to retry)'}
              onClick={() => !socket?.connected && window.location.reload()}
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202c33] cursor-pointer ${socket?.connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 animate-pulse'}`}
            ></div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-100">{partnerName || 'Chat Partner'}</h3>
              <span className="text-[8px] text-gray-500 font-mono hidden md:inline">ID: {partnerId?.toString()}</span>
            </div>
            <p className="text-[10px] text-gray-400">
              {partnerTyping ? (
                <span className="text-green-400 animate-pulse font-medium uppercase tracking-widest text-[9px]">Typing...</span>
              ) : (
                <span className="text-emerald-500">{socket?.connected ? 'Online' : 'Offline'}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <MoreVertical size={20} className="cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Chat Background / Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a] custom-scrollbar"
        style={{
          backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-dark-background-w-whatsapp-dark-pattern.jpg")',
          backgroundSize: '400px',
          backgroundBlendMode: 'overlay'
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs animate-pulse">Loading secure chat...</p>
          </div>
        ) : (
          <>
            {console.log('[DEBUG] Message render check:', {
              loading,
              messagesLength: messages.length,
              messages: messages,
              messagesType: typeof messages,
              isArray: Array.isArray(messages)
            })}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                <div className="p-4 bg-gray-800/50 rounded-full">
                  <UserIcon size={32} className="text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const msgSenderId = msg.sender?._id || msg.sender;
                const currentUserId = currentUser?._id || currentUser?.id;
                
                // Robust consolidated identity check via ID, User ID, email, or senderType matches
                const currentUserUserId = currentUser?.userId?.toString();
                const isMe = msgSenderId?.toString() === currentUserId?.toString() ||
                             (currentUserUserId && msgSenderId?.toString() === currentUserUserId) ||
                             (msg.sender?.email && currentUser?.email && msg.sender.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                             (msg.senderType === 'user' && currentUser?.role === 'user');

                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 shadow-md relative group transition-all duration-300 transform hover:scale-[1.01] ${isMe
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
              })
            )}
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
          </>
        )}
      </div>

      {/* Input Area */}
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
            placeholder="Type a message..."
            className="w-full bg-[#2a3942] text-gray-100 py-2 px-4 rounded-xl focus:outline-none border border-transparent focus:border-gray-600 transition-all text-sm"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className={`p-2 rounded-full transition-all ${newMessage.trim()
              ? 'bg-[#00a884] text-white scale-110 shadow-lg'
              : 'bg-gray-700 text-gray-400'
            }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
