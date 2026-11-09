import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare,
  RefreshCw, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { messagesAPI } from '../services/api';
import SEO from './SEO';
import ChatWindow from './ChatWindow';
import { io } from 'socket.io-client';
import { cn } from '../lib/utils';

// Helper to resolve socket URL
const resolveSocketUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
  return 'https://sverxiioo.nanoprofiles.com';
};

const SOCKET_URL = resolveSocketUrl();

const ADMIN_IDS = new Set(['6a01d63b3d04d8fc5ee912b2']);
const ADMIN_EMAILS = new Set([
  'artartistofficial@gmail.com',
  'artartistdata@gmail.com'
]);

/** Safe avatar URL — avoids crash when partner.image is undefined but photoURL exists */
const getPartnerAvatarUrl = (partner) => {
  if (!partner) return null;
  const pId = (partner._id || partner.id)?.toString();
  const email = partner.email?.toLowerCase();

  if (ADMIN_IDS.has(pId) || ADMIN_EMAILS.has(email)) {
    return '/uday_dp.jpeg';
  }

  if (typeof partner.image === 'string' && partner.image) return partner.image;
  if (partner.image?.url) return partner.image.url;
  if (partner.photoURL) return partner.photoURL;
  return null;
};

/** Get display name, mapping admin to uday(the founder of artartist) */
const getPartnerDisplayName = (partner) => {
  if (!partner) return 'Artist';
  const pId = (partner._id || partner.id)?.toString();
  const email = partner.email?.toLowerCase();
  const name = partner.name || partner.displayName;
  if (ADMIN_IDS.has(pId) || ADMIN_EMAILS.has(email)) {
    return 'uday(the founder of artartist)';
  }
  return name || 'Artist';
};

const isAdminPartner = (partner, partnerId, lastMessage) => {
  const pId = (partnerId || partner?._id || partner?.id)?.toString();
  const email = partner?.email?.toLowerCase();
  return (
    partner?.role === 'admin' ||
    ADMIN_IDS.has(pId) ||
    ADMIN_EMAILS.has(email) ||
    lastMessage?.senderType === 'admin'
  );
};

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [inboxSocket, setInboxSocket] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(null);
  const refetchTimerRef = useRef(null);
  const conversationsRef = useRef(conversations);
  const pendingStartChatRef = useRef(null);

  conversationsRef.current = conversations;

  // Capture Hire Artist payload immediately (before effects clear location.state)
  const startChatFromNav = location.state?.startChatWith;
  if (startChatFromNav) {
    pendingStartChatRef.current = startChatFromNav;
  }

  const isArtist = user?.role === 'artist' || user?.isArtist;
  // Never show the empty desktop placeholder as the only mobile screen
  const mobileShowingChat = showMobileChat && !!selectedConversation;

  // Keep chat composer above mobile keyboard via visualViewport
  useEffect(() => {
    const updateHeight = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      setViewportHeight(h);
    };
    updateHeight();
    window.visualViewport?.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('scroll', updateHeight);
    window.addEventListener('resize', updateHeight);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // ── Handle Initial Chat Trigger (once when startChatWith is present) ───────
  useEffect(() => {
    if (!isAuthenticated || loadingMessages) return;
    const target = pendingStartChatRef.current;
    if (!target) return;
    pendingStartChatRef.current = null;

    const targetId = (target._id || target.id)?.toString();
    if (!targetId) return;

    const existing = conversationsRef.current.find(
      (c) => (c.partner?._id || c.partner?.id)?.toString() === targetId
    );

    const avatarUrl =
      typeof target.image === 'string'
        ? target.image
        : target.image?.url || target.photoURL || null;

    const nextSelected = existing || {
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

    if (!existing) {
      setConversations((prev) => {
        if (prev.some((c) => (c.partner?._id || c.partner?.id)?.toString() === targetId)) {
          return prev;
        }
        return [nextSelected, ...prev];
      });
    }

    setSelectedConversation(nextSelected);
    setShowMobileChat(true);
    navigate('.', { replace: true, state: {} });
  }, [isAuthenticated, loadingMessages, location.key, navigate]);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // ── Fetch conversations only (no unused getMessages) ──────────────────────
  const fetchMessages = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingMessages(true);
      const convData = await messagesAPI.getConversations();
      const newConvs = Array.isArray(convData) ? convData : [];
      setConversations(newConvs);
    } catch (err) {
      console.warn('API error fetching messages:', err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  const patchInboxFromMessage = useCallback((msg) => {
    if (!msg || !user) return;

    const myId = (user._id || user.id)?.toString();
    const myEmail = user.email?.toLowerCase();
    const sender = msg.sender;
    const recipient = msg.recipient;
    const sId = (sender?._id || sender)?.toString();
    const isMeSender =
      sId === myId ||
      (sender?.email && myEmail && sender.email.toLowerCase() === myEmail);

    const partner = isMeSender ? recipient : sender;
    if (!partner) return;

    const partnerId = (partner._id || partner)?.toString();
    const partnerEmail = partner.email?.toLowerCase();

    setConversations((prev) => {
      const idx = prev.findIndex((c) => {
        const pId = (c.partner?._id || c.partner?.id)?.toString();
        const pEmail = c.partner?.email?.toLowerCase();
        return (
          (partnerEmail && pEmail === partnerEmail) ||
          pId === partnerId ||
          c.partnerId?.toString() === partnerId
        );
      });

      if (idx === -1) {
        return [
          {
            partner: typeof partner === 'object' ? partner : { _id: partnerId },
            partnerId,
            lastMessage: msg,
            unreadCount: isMeSender ? 0 : 1
          },
          ...prev
        ];
      }

      const updated = [...prev];
      const existing = updated[idx];
      updated[idx] = {
        ...existing,
        lastMessage: msg,
        unreadCount: isMeSender ? existing.unreadCount || 0 : (existing.unreadCount || 0) + 1,
        isTemp: false
      };
      const [row] = updated.splice(idx, 1);
      return [row, ...updated];
    });
  }, [user]);

  // ── Sync Selected Conversation when list updates ──────────────────────────
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const fresh = conversations.find(c =>
        (c.partner?._id || c.partner?.id) === (selectedConversation.partner?._id || selectedConversation.partner?.id)
      );
      if (fresh && fresh !== selectedConversation) {
        setSelectedConversation(fresh);
      }
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (isAuthenticated) fetchMessages();
  }, [isAuthenticated, fetchMessages]);

  // ── Shared Socket for Inbox + ChatWindow ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const myId = user._id || user.id;
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    const joinRooms = () => {
      socket.emit('join_conversation', `user_${myId}`);
    };

    socket.on('connect', joinRooms);

    socket.on('new_message_notification', (msg) => {
      // Prefer local list patch from payload; debounce full refetch as fallback
      if (msg && (msg._id || msg.text)) {
        patchInboxFromMessage(msg);
        return;
      }
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      refetchTimerRef.current = setTimeout(() => {
        fetchMessages(true);
      }, 400);
    });

    setInboxSocket(socket);

    return () => {
      if (refetchTimerRef.current) clearTimeout(refetchTimerRef.current);
      socket.disconnect();
      setInboxSocket(null);
    };
  }, [isAuthenticated, user, fetchMessages, patchInboxFromMessage]);

  
  if (!isAuthenticated || !user) return null;

  return (
    <>
      <SEO
        title="Messages | Art Marketplace"
        description="Manage your conversations with artists."
      />

      <div
        className="flex h-screen h-[100dvh] bg-[#f8f9fa] overflow-hidden font-sans antialiased text-gray-800"
        style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
      >

        {/* ── Main Content Area (Full Bleed, No Redundant Left Rail) ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Conversation List Sidebar */}
          <div
            className={cn(
              'w-full md:w-80 lg:w-96 bg-white flex flex-col border-r border-gray-200 shadow-sm',
              mobileShowingChat && 'max-md:hidden'
            )}
          >
            <div className="p-4 md:p-5 flex flex-col gap-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
                  <span className="relative flex h-2.5 w-2.5" title="Live Messaging Active">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                  </span>
                </div>
                <div className="flex gap-1.5 items-center">
                  <button
                    onClick={() => fetchMessages()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-700"
                    title="Refresh"
                  >
                    <RefreshCw size={18} className={loadingMessages ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Back to Home Button */}
              <button 
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-all border border-gray-200 active:scale-95 duration-200 shadow-2xs"
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>

              {/* Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl border border-gray-200/80">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {(user.displayName || user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.displayName || 'User'}</p>
                  <p className="text-[10px] text-gray-500 font-semibold truncate uppercase tracking-wider">{isArtist ? 'Artist Profile' : 'Collector Account'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
              <div className="space-y-1">
                {loadingMessages ? (
                  <div className="p-16 flex flex-col items-center gap-3 opacity-60">
                    <RefreshCw size={28} className="animate-spin text-red-500" />
                    <p className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">Syncing...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-16 text-center flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <MessageSquare size={26} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv, idx) => {
                    const { partner, lastMessage, unreadCount } = conv;
                    const partnerId = partner?._id || partner?.id;
                    const isSelected = selectedConversation?.partner?._id === partnerId;
                    const avatarUrl = getPartnerAvatarUrl(partner);
                    const partnerDisplayName = getPartnerDisplayName(partner);
                    const adminPartner = isAdminPartner(partner, partnerId, lastMessage);

                    return (
                      <div
                        key={partnerId || idx}
                        onClick={() => {
                          setSelectedConversation({
                            partner: {
                              ...partner,
                              name: partnerDisplayName,
                              displayName: partnerDisplayName
                            },
                            partnerId: partner._id || partner.id,
                            lastMessage,
                            unreadCount
                          });
                          setShowMobileChat(true);
                        }}
                        className={`group p-3.5 flex items-center gap-3.5 cursor-pointer rounded-2xl transition-all duration-200 mx-1 mb-1 ${
                          isSelected 
                            ? 'bg-red-50 border border-red-200/80 shadow-xs' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-transform duration-200 group-hover:scale-105 ${isSelected ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200'}`}>
                            {avatarUrl ? (
                              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-600 font-bold text-base">
                                {(partnerDisplayName || 'A')[0]}
                              </div>
                            )}
                          </div>

                          {/* Red dot that blinks for unread messages */}
                          {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white shadow-xs"></span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`text-sm font-bold truncate flex items-center gap-1.5 ${isSelected ? 'text-red-600 font-extrabold' : 'text-gray-900'}`}>
                              <span>{partnerDisplayName}</span>
                              {adminPartner && (
                                <svg className="w-3.5 h-3.5 fill-[#0095f6] flex-shrink-0" viewBox="0 0 24 24" aria-label="Verified account">
                                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.512 1.5 12 1.5s-2.77 1.015-3.412 2.285C8.171 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.412 5.28 3.412 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275C9.23 21.485 10.488 22.5 12 22.5s2.77-1.015 3.412-2.285c.418.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.43l-4.24-4.24 1.41-1.41 2.83 2.82 7.07-7.07 1.41 1.41-8.48 8.49z"></path>
                                </svg>
                              )}
                            </h4>
                            {lastMessage && (
                              <span className="text-[10px] text-gray-400 font-medium">
                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
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
          <div
            className={cn(
              'flex-1 bg-[#f8f9fa] relative flex-col min-h-0',
              mobileShowingChat ? 'flex' : 'hidden md:flex'
            )}
          >
            {selectedConversation ? (
              <ChatWindow
                currentUser={user}
                partnerId={selectedConversation.partnerId || selectedConversation.partner?._id}
                partnerName={getPartnerDisplayName(selectedConversation.partner)}
                partnerImage={getPartnerAvatarUrl(selectedConversation.partner)}
                partnerEmail={selectedConversation.partner?.email}
                partnerRole={selectedConversation.partner?.role}
                socket={inboxSocket}
                onBack={() => setShowMobileChat(false)}
                onNewMessage={patchInboxFromMessage}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 relative shadow-md border border-gray-100">
                  <MessageSquare size={44} className="text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-600 rounded-lg rotate-12 flex items-center justify-center shadow-md shadow-red-600/20">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Creative Space</h2>
                <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
                  Select an artist from the sidebar to continue your creative journey. All your chats are encrypted and secure.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-600/20 hover:scale-105 active:scale-95 text-sm"
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
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.12); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.22); }
      `}} />
    </>
  );
};

export default UserDashboard;
