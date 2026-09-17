import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, MessageSquare,
  RefreshCw, CheckCircle2, ArrowLeft, Home
} from 'lucide-react';
import { logoutFirebase } from '../firebase';
import { messagesAPI } from '../services/api';
import SEO from './SEO';
import ChatWindow from './ChatWindow';
import { io } from 'socket.io-client';

// Helper to resolve socket URL
const resolveSocketUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
  return 'https://sverxiioo.nanoprofiles.com';
};

const SOCKET_URL = resolveSocketUrl();

/** Safe avatar URL — avoids crash when partner.image is undefined but photoURL exists */
const getPartnerAvatarUrl = (partner) => {
  if (!partner) return null;
  if (typeof partner.image === 'string' && partner.image) return partner.image;
  if (partner.image?.url) return partner.image.url;
  if (partner.photoURL) return partner.photoURL;
  return null;
};

const UserDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const isArtist = user?.role === 'artist' || user?.isArtist;

  // ── Handle Initial Chat Trigger ───────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && !loadingMessages && location.state?.startChatWith) {
      const target = location.state.startChatWith;
      const targetId = target._id || target.id;

      // Check if conversation already exists
      const existing = conversations.find(c => (c.partner?._id || c.partner?.id) === targetId);

      if (existing) {
        setSelectedConversation(existing);
      } else {
        // Create a temporary conversation entry
        const avatarUrl =
          typeof target.image === 'string'
            ? target.image
            : target.image?.url || target.photoURL || null;

        const tempConv = {
          partner: {
            _id: targetId,
            name: target.name,
            displayName: target.name,
            ...(avatarUrl ? { image: { url: avatarUrl }, photoURL: avatarUrl } : {}),
            email: target.email
          },
          partnerId: targetId,
          lastMessage: { text: 'Start a new conversation...', createdAt: new Date() },
          unreadCount: 0,
          isTemp: true
        };
        setConversations(prev => [tempConv, ...prev]);
        setSelectedConversation(tempConv);
      }

      // Clear location state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [isAuthenticated, loadingMessages, location.state, conversations]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // ── Fetch messages from real API ──────────────────────────────────────────
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const convData = await messagesAPI.getConversations();
      const newConvs = Array.isArray(convData) ? convData : [];
      setConversations(newConvs);

      await messagesAPI.getMessages();
      // setMessages(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.warn('API error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // ── Sync Selected Conversation when list updates ──────────────────────────
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const fresh = conversations.find(c =>
        (c.partner?._id || c.partner?.id) === (selectedConversation.partner?._id || selectedConversation.partner?.id)
      );
      // Only update if the object reference is actually different to avoid unnecessary re-renders
      if (fresh && fresh !== selectedConversation) {
        setSelectedConversation(fresh);
      }
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (isAuthenticated) fetchMessages();
  }, [isAuthenticated, fetchMessages]);

  // ── Global Socket for Inbox Updates ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const myId = user._id || user.id;
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Dashboard Socket Connected:', socket.id);
      socket.emit('join_conversation', `user_${myId}`);
    });

    socket.on('new_message_notification', (newMsg) => {
      console.log('🔔 New message notification for inbox:', newMsg);
      fetchMessages(true);
    });

    return () => socket.disconnect();
  }, [isAuthenticated, user, fetchMessages]);

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <>
      <SEO
        title="Messages | Art Marketplace"
        description="Manage your conversations with artists."
      />

      <div className="flex h-screen bg-[#111b21] overflow-hidden font-sans antialiased text-gray-200">

        {/* ── Left Navigation Rail ── */}
        <div className="hidden md:flex w-16 flex-col items-center py-4 bg-[#202c33] border-r border-white/5">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center mb-6 cursor-pointer hover:rotate-12 transition-transform shadow-lg shadow-red-600/20" onClick={() => navigate('/')}>
            <span className="font-bold text-white text-xl">A</span>
          </div>

          <div className="flex flex-col gap-6 mt-4 flex-1">
            <div className="p-2 bg-white/10 rounded-lg text-white cursor-pointer"><MessageSquare size={24} /></div>
            <div className="p-2 text-gray-500 hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')} title="Back to Home"><Home size={24} /></div>
          </div>

          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 transition-colors mt-auto">
            <LogOut size={24} />
          </button>
        </div>

        {/* ── Main Content Area ── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Conversation List Sidebar */}
          <div className={`${showMobileChat ? 'hidden' : 'flex'} w-full md:flex md:w-80 lg:w-96 bg-[#111b21] flex flex-col border-r border-white/5`}>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
                </div>
                <div className="flex gap-2">
                  <button onClick={fetchMessages} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                    <RefreshCw size={18} className={loadingMessages ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={handleLogout} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-red-500 md:hidden">
                    <LogOut size={18} />
                  </button>
                </div>
              </div>

              {/* Back to Home Button for Mobile & PC screens */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-white/10 active:scale-95 duration-200"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-lg">
                  {(user.displayName || user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">{isArtist ? 'Artist Profile' : 'Collector Account'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
              <div className="space-y-1">
                {loadingMessages ? (
                  <div className="p-20 flex flex-col items-center gap-4 opacity-30">
                    <RefreshCw size={32} className="animate-spin text-red-500" />
                    <p className="text-xs font-mono uppercase tracking-[0.2em]">Syncing...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-700">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-gray-500 text-sm italic">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv, idx) => {
                    const { partner, lastMessage, unreadCount } = conv;
                    const partnerId = partner?._id || partner?.id;
                    const isSelected = selectedConversation?.partner?._id === partnerId;
                    const avatarUrl = getPartnerAvatarUrl(partner);

                    return (
                      <div
                        key={partnerId || idx}
                        onClick={() => {
                          console.log('[DEBUG] Selected conversation:', { partner, partnerId, unreadCount });
                          console.log('[DEBUG] Partner details:', {
                            partnerId: partner._id || partner.id,
                            partnerName: partner?.name || partner?.displayName,
                            partnerEmail: partner?.email,
                            partnerFull: partner
                          });
                          setSelectedConversation({
                            partner,
                            partnerId: partner._id || partner.id,
                            lastMessage,
                            unreadCount
                          });
                          setShowMobileChat(true);
                        }}
                        className={`group p-4 flex items-center gap-4 cursor-pointer rounded-2xl transition-all duration-300 mx-2 mb-1 ${isSelected ? 'bg-red-600/10 border border-red-600/20' : 'hover:bg-white/5 border border-transparent'
                          }`}
                      >
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform duration-300 group-hover:scale-105 ${isSelected ? 'border-red-600' : 'border-white/10'}`}>
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 font-bold text-lg">
                                {(partner?.name || partner?.displayName || 'A')[0]}
                              </div>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-[#111b21] animate-bounce">
                              {unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-red-500' : 'text-white'}`}>
                              {partner?.name || partner?.displayName || 'Artist'}
                            </h4>
                            {lastMessage && (
                              <span className="text-[9px] text-gray-500 font-medium">
                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-200 font-bold' : 'text-gray-500'}`}>
                            {lastMessage?.text || 'Start a conversation'}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-1.5 h-6 bg-red-600 rounded-full" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* Chat Window Container */}
          <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex flex-1 bg-[#0b141a] relative flex flex-col`}>
            {selectedConversation ? (
              <>
                {console.log('[DEBUG] Rendering ChatWindow with:', {
                  selectedConversation,
                  partnerId: selectedConversation.partner?._id,
                  partnerName: selectedConversation.partner?.name || selectedConversation.partner?.displayName,
                  partnerEmail: selectedConversation.partner?.email,
                  currentUser: user
                })}
                <ChatWindow
                  currentUser={user}
                  partnerId={selectedConversation.partnerId || selectedConversation.partner?._id}
                  partnerName={selectedConversation.partner?.name || selectedConversation.partner?.displayName}
                  partnerImage={getPartnerAvatarUrl(selectedConversation.partner)}
                  partnerEmail={selectedConversation.partner?.email}
                  onBack={() => setShowMobileChat(false)}
                  onNewMessage={(msg) => {
                    fetchMessages(true); // Silent refresh
                  }}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 relative">
                  <MessageSquare size={64} className="text-white/10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-lg rotate-12 flex items-center justify-center shadow-lg shadow-red-600/20">
                    <CheckCircle2 size={18} className="text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Your Creative Space</h2>
                <p className="text-gray-500 max-w-sm leading-relaxed">
                  Select an artist from the sidebar to continue your creative journey. All your chats are encrypted and secure.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20"
                >
                  Discover More Artists
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </>
  );
};

export default UserDashboard;
