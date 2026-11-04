import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  User, Mail, Calendar, Edit, ShoppingBag, Heart, Settings,
  LogOut, ArrowLeft, MapPin, CheckCircle2, ShieldCheck, Lock,
  Bell, Sparkles, Hash, X
} from 'lucide-react';
import { artistAuth } from './artist/services/api';
import { usersAPI } from '../services/api';
import { logoutFirebase, auth } from '../firebase';
import { sendPasswordResetEmail, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { AnimatedTicket } from './ui/ticket-confirmation-card';

const UserProfile = () => {
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('tab') || 'overview';
  });
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ displayName: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [artistProfile, setArtistProfile] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['overview', 'orders', 'favorites', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    const fetchTickets = async () => {
      if (isAuthenticated && activeTab === 'orders') {
        try {
          setLoadingEvents(true);
          const data = await usersAPI.getRegisteredEvents();
          setRegisteredEvents(data.events || []);
        } catch (err) {
          console.error('Failed to fetch user registered events:', err);
        } finally {
          setLoadingEvents(false);
        }
      }
    };
    fetchTickets();
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    document.title = 'My Profile - ARTARTIST';
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setProfileForm({ displayName: user.displayName || user.name || '' });
    }
  }, [user]);

  useEffect(() => {
    const checkArtistStatus = async () => {
      // Check cached artist profile immediately for instant UI
      try {
        const cached = localStorage.getItem('artistData');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed._id || parsed.artistNumber)) {
            setArtistProfile(parsed);
          }
        }
      } catch (e) {
        // Ignore cache parse error
      }

      const userToken = localStorage.getItem('authToken');
      if (userToken) {
        try {
          const response = await artistAuth.ssoLogin(userToken);
          if (response.success && response.artist) {
            setArtistProfile(response.artist);
            if (response.token) {
              localStorage.setItem('artistToken', response.token);
            }
            localStorage.setItem('artistData', JSON.stringify(response.artist));
          }
        } catch (err) {
          console.log('SSO status check: Not a registered artist profile');
        }
      }
    };
    checkArtistStatus();
  }, []);

  const handleSaveProfile = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const newName = (profileForm.displayName || '').trim();
    if (!newName) {
      setSettingsMessage('Display name cannot be empty.');
      return;
    }

    try {
      setSavingProfile(true);
      setSettingsMessage('');

      // 1. Update Firebase Auth displayName if available
      try {
        if (auth.currentUser) {
          await updateFirebaseProfile(auth.currentUser, { displayName: newName });
        }
      } catch (fbErr) {
        console.warn('Firebase profile displayName update warning:', fbErr);
      }

      // 2. Update Backend Database & AuthContext
      await updateUser({ displayName: newName });

      // 3. Ensure localStorage user object has updated name
      try {
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedLocal = { ...cachedUser, displayName: newName, name: newName };
        localStorage.setItem('user', JSON.stringify(updatedLocal));
      } catch (err) {}

      setEditingProfile(false);
      setIsEditModalOpen(false);
      setSettingsMessage('Profile name updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      // Fallback: update locally so user sees immediate feedback
      try {
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedLocal = { ...cachedUser, displayName: newName, name: newName };
        localStorage.setItem('user', JSON.stringify(updatedLocal));
      } catch (e) {}
      setEditingProfile(false);
      setIsEditModalOpen(false);
      setSettingsMessage(err.response?.data?.error || err.message || 'Profile name updated.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setSettingsMessage('No email on file for password reset.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      setSettingsMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setSettingsMessage(err.message || 'Could not send reset email.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#DC2626] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#64748B] font-medium text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const joinDate = (user.createdAt || user.metadata?.creationTime) 
    ? new Date(user.createdAt || user.metadata.creationTime).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }) 
    : 'Recently';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Bookings', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Modern Profile Header Card ── */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {/* Refined Red-Accented Cover Banner with exact dark red #C31D1D */}
          <div className="h-36 sm:h-44 bg-[#C31D1D] relative shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C31D1D] via-[#A81717] to-[#8E1212] opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_65%)]" />
            <div className="relative p-4 sm:p-6 flex items-center justify-between">
              <Link 
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-black/25 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/20 shadow-xs active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Back to Home</span>
              </Link>
              <span className="px-3.5 py-1 text-[11px] font-bold text-white bg-white/20 backdrop-blur-md border border-white/20 rounded-full uppercase tracking-wider hidden sm:inline-block shadow-xs">
                {artistProfile ? 'ArtArtist Creator' : 'Collector Member'}
              </span>
            </div>
          </div>

          {/* Profile Meta Area: Strictly Clean Spacing (Avatar Pops onto Banner, Info Sits 100% on White) */}
          <div className="px-6 sm:px-8 pb-7 pt-0">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              
              {/* Left Group: Avatar + Details (No Negative Margin on Text) */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-end gap-5 sm:gap-6 text-center sm:text-left">
                {/* Properly Sized Avatar with its own Negative Margin */}
                <div className="relative -mt-16 sm:-mt-20 flex-shrink-0 z-10">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1.5 bg-white shadow-lg border-2 border-white ring-1 ring-black/5 overflow-hidden">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-full h-full rounded-2xl object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentElement.querySelector('.profile-placeholder');
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${user.photoURL ? 'hidden profile-placeholder' : 'flex'} w-full h-full rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#991B1B] text-white items-center justify-center text-4xl font-black shadow-inner`}>
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  </div>
                  {artistProfile && (
                    <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#16A34A] border-3 border-white rounded-full flex items-center justify-center shadow-md" title="Active Artist">
                      <CheckCircle2 size={15} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Name, Membership Badge, Email, Join Date (Completely on White Surface) */}
                <div className="pt-2 sm:pt-3 pb-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight truncate max-w-md">
                      {user.displayName || 'User'}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm({ displayName: user.displayName || user.name || '' });
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-[#64748B] hover:text-[#DC2626] transition-colors"
                      title="Edit your display name"
                    >
                      <Edit size={16} />
                    </button>
                    {artistProfile ? (
                      <span className="px-3 py-1 text-[11px] font-bold bg-red-50 text-[#DC2626] border border-red-200/80 rounded-full uppercase tracking-wider shadow-2xs">
                        Artist Member
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-[11px] font-bold bg-slate-100 text-[#64748B] border border-[#E5E7EB] rounded-full uppercase tracking-wider">
                        Collector
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail size={14} className="text-[#DC2626]" />
                      <span className="truncate max-w-xs">{user.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-[#DC2626]" />
                      Member since {joinDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Group: Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start md:justify-end gap-2.5 pt-2 lg:pt-0">
                {artistProfile && (
                  <Link
                    to="/artist/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 duration-200"
                  >
                    <span>Artist Dashboard</span>
                    <span>&rarr;</span>
                  </Link>
                )}
                <button 
                  type="button"
                  onClick={() => {
                    setProfileForm({ displayName: user.displayName || user.name || '' });
                    setIsEditModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#111827] rounded-xl text-xs font-semibold transition-all border border-[#E5E7EB] shadow-2xs active:scale-95"
                >
                  <Edit size={14} className="text-[#64748B]" />
                  <span>Edit Profile</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-red-50 text-[#64748B] hover:text-[#DC2626] rounded-xl text-xs font-semibold transition-all border border-[#E5E7EB] active:scale-95"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* ── Main Layout: Sidebar Navigation & Content ── */}
        <div className="grid md:grid-cols-12 gap-6 items-start">

          {/* ── Left Sidebar Navigation (Sticky on Desktop) ── */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4 md:sticky md:top-6">
            
            {/* Navigation Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-3 shadow-xs">
              {/* Mobile Horizontal Tabs */}
              <div className="flex overflow-x-auto gap-1 pb-1 md:hidden">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-red-50 text-[#DC2626] font-bold border border-red-200'
                          : 'text-[#64748B] hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-[#DC2626]' : 'text-[#64748B]'} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Vertical Navigation */}
              <nav className="hidden md:flex flex-col space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                        isSelected
                          ? 'bg-red-50 text-[#DC2626] font-bold border border-red-100'
                          : 'text-[#64748B] hover:bg-slate-50 hover:text-[#111827]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isSelected ? 'text-[#DC2626]' : 'text-[#64748B]'} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.id === 'orders' && registeredEvents.length > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSelected ? 'bg-red-100 text-[#DC2626]' : 'bg-slate-100 text-[#64748B]'
                        }`}>
                          {registeredEvents.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Activity Summary Section */}
              <div className="pt-3.5 mt-3 border-t border-[#E5E7EB] px-1">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">Activity Summary</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB] text-center">
                    <div className="flex items-center justify-center text-[#DC2626] mb-1">
                      <ShoppingBag size={14} />
                    </div>
                    <span className="text-[10px] font-medium text-[#64748B] uppercase">Bookings</span>
                    <p className="text-xl font-bold text-[#111827] mt-0.5">{registeredEvents.length}</p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E5E7EB] text-center">
                    <div className="flex items-center justify-center text-[#DC2626] mb-1">
                      <Heart size={14} />
                    </div>
                    <span className="text-[10px] font-medium text-[#64748B] uppercase">Favorites</span>
                    <p className="text-xl font-bold text-[#111827] mt-0.5">0</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ── Right Content Area ── */}
          <div className="md:col-span-8 lg:col-span-9 space-y-6">

            {/* ── TAB: OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Profile Overview Section Card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
                      <User className="w-5 h-5 text-[#DC2626]" />
                      <span>Profile Overview</span>
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Your ArtArtist member identification and profile status</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] flex-shrink-0 shadow-2xs">
                        <User size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Full Name</p>
                        <p className="font-bold text-[#111827] text-sm truncate">{user.displayName || 'Not set'}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] flex-shrink-0 shadow-2xs">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Email Address</p>
                        <p className="font-bold text-[#111827] text-sm truncate" title={user.email}>{user.email}</p>
                      </div>
                    </div>

                    {/* Artist ID Card */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#DC2626] flex-shrink-0 shadow-2xs">
                        <Hash size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Artist ID</p>
                        {artistProfile ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-bold text-[#DC2626] text-base tracking-tight">
                              {artistProfile.artistNumber 
                                ? (artistProfile.artistNumber.startsWith('#') ? artistProfile.artistNumber : `#${artistProfile.artistNumber}`) 
                                : (artistProfile._id || artistProfile.id ? `#${String(artistProfile._id || artistProfile.id).slice(-6).toUpperCase()}` : '#ARTIST')}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-[#16A34A] border border-green-200 rounded-md">
                              Active
                            </span>
                          </div>
                        ) : (
                          <div className="mt-0.5">
                            <p className="text-xs text-[#64748B] mb-1">No artist ID registered yet</p>
                            <Link
                              to="/artist-hub"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#DC2626] hover:text-[#B91C1C] transition-colors underline"
                            >
                              <span>Get your Artist ID &rarr;</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Account Role */}
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] flex-shrink-0 shadow-2xs">
                        <ShieldCheck size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Account Role</p>
                        <p className="font-bold text-[#111827] text-sm capitalize flex items-center gap-2">
                          <span>{artistProfile ? (user.role === 'admin' ? 'Admin / Artist' : 'Artist Member') : (user.role || 'Collector')}</span>
                          {artistProfile && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-50 text-[#DC2626] border border-red-200 rounded-md">
                              Verified
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section: Artist Quick Studio (Clean Premium White Card) ── */}
                {artistProfile && (
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#DC2626]" />
                          <h3 className="font-bold text-[#111827] text-base">Artist Quick Studio</h3>
                        </div>
                        <p className="text-xs text-[#64748B] max-w-md">
                          Manage your artworks gallery, view e-commerce sales disbursements, and interact with collectors.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <Link
                          to="/artist/dashboard"
                          className="px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                        >
                          Open Artist Dashboard &rarr;
                        </Link>
                        {artistProfile._id && (
                          <Link
                            to={`/artist/${artistProfile._id}`}
                            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#111827] rounded-xl text-xs font-semibold transition-all border border-[#E5E7EB]"
                          >
                            Public Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Section: Explore Art Community (Clean Promotional Card) ── */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-[#111827] text-sm">Explore the Art Community</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">Discover works from creators or attend upcoming art events.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      to="/art" 
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] rounded-xl text-xs font-semibold transition-colors"
                    >
                      Browse Art Store
                    </Link>
                    <Link 
                      to="/events" 
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#111827] rounded-xl text-xs font-semibold transition-colors"
                    >
                      Events
                    </Link>
                  </div>
                </div>

              </div>
            )}

            {/* ── TAB: ORDERS / BOOKINGS ── */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#DC2626]" />
                    <span>My Bookings & Passes</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Your registered events and pass confirmations</p>
                </div>

                {loadingEvents ? (
                  <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#DC2626] border-t-transparent"></div>
                  </div>
                ) : registeredEvents.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {registeredEvents.map((event) => (
                      <div key={event._id} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-[#DC2626] border border-red-200 rounded-full uppercase tracking-wider">
                              {event.category}
                            </span>
                            <span className="text-[11px] text-[#64748B] font-mono font-medium">
                              #{event._id.substring(18, 24).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="font-bold text-[#111827] text-sm mb-1.5 line-clamp-1">{event.title}</h3>
                          <p className="text-[#64748B] text-xs flex items-center gap-1.5 mb-1">
                            <Calendar size={13} className="text-[#64748B]" />
                            <span>{new Date(event.date?.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(event.date?.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          </p>
                          <p className="text-[#64748B] text-xs flex items-center gap-1.5 mb-3">
                            <MapPin size={13} className="text-[#64748B]" />
                            <span className="truncate">{event.location?.address || event.location?.city}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedTicketEvent(event)}
                          className="w-full py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95"
                        >
                          View Ticket Pass
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#F8FAFC] rounded-xl p-10 text-center border border-[#E5E7EB]">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-[#E5E7EB]">
                      <ShoppingBag size={20} className="text-[#64748B]" />
                    </div>
                    <h4 className="font-bold text-[#111827] text-sm">No tickets or bookings found</h4>
                    <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto mb-4">
                      You haven't registered for any events yet. Explore upcoming art fairs and workshops.
                    </p>
                    <Link to="/events" className="inline-flex px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-semibold transition-all shadow-xs">
                      Browse Upcoming Events
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: FAVORITES ── */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#DC2626]" />
                    <span>My Favorites</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Artworks and exhibitions you have bookmarked</p>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-10 text-center border border-[#E5E7EB]">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-[#E5E7EB]">
                    <Heart size={20} className="text-[#64748B]" />
                  </div>
                  <h4 className="font-bold text-[#111827] text-sm">No saved favorites yet</h4>
                  <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto mb-4">
                    Explore our curated marketplace and tap the heart icon to save artworks you love.
                  </p>
                  <Link to="/art" className="inline-flex px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-semibold transition-all shadow-xs">
                    Discover Artworks
                  </Link>
                </div>
              </div>
            )}

            {/* ── TAB: SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#DC2626]" />
                    <span>Account Settings</span>
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">Manage your personal credentials, profile name, and notifications</p>
                </div>

                {settingsMessage && (
                  <div className="p-3.5 bg-green-50 border border-green-200 text-[#16A34A] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 size={16} />
                    <span>{settingsMessage}</span>
                  </div>
                )}

                <div className="space-y-3.5">
                  {/* Setting 1: Profile Information */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shadow-2xs flex-shrink-0">
                          <User size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#111827] text-sm">Profile Display Name</h3>
                          <p className="text-xs text-[#64748B] mt-0.5">Your public display name shown to artists and collectors.</p>
                          {!editingProfile && (
                            <p className="text-sm font-bold text-[#111827] mt-2 bg-white px-3 py-1 rounded-lg border border-[#E5E7EB] inline-block shadow-2xs">
                              {user.displayName || 'Not set'}
                            </p>
                          )}
                        </div>
                      </div>

                      {!editingProfile && (
                        <button
                          type="button"
                          onClick={() => setEditingProfile(true)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {editingProfile && (
                      <div className="mt-4 pt-4 border-t border-[#E5E7EB] space-y-3">
                        <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">New Display Name</label>
                        <input
                          type="text"
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ displayName: e.target.value })}
                          placeholder="Enter your name"
                          className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3.5 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition-all"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProfile(false);
                              setProfileForm({ displayName: user.displayName || user.name || '' });
                            }}
                            className="px-3.5 py-1.5 bg-white text-[#64748B] text-xs font-semibold rounded-lg hover:bg-slate-50 border border-[#E5E7EB]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="px-4 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
                          >
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Setting 2: Password & Security */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shadow-2xs flex-shrink-0">
                          <Lock size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#111827] text-sm">Password & Security</h3>
                          <p className="text-xs text-[#64748B] mt-0.5">Request a password reset link to update your credentials safely.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-[#111827] border border-[#E5E7EB] rounded-lg text-xs font-semibold transition-all shadow-2xs active:scale-95 whitespace-nowrap self-start sm:self-auto"
                      >
                        Send Reset Email &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Setting 3: Notifications */}
                  <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-5 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shadow-2xs flex-shrink-0">
                        <Bell size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-[#111827] text-sm">Email Notifications</h3>
                            <p className="text-xs text-[#64748B] mt-0.5">Receive email alerts for incoming messages, bookings, and platform updates.</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-3">
                            <input
                              type="checkbox"
                              checked={emailNotifications}
                              onChange={(e) => {
                                setEmailNotifications(e.target.checked);
                                setSettingsMessage(
                                  e.target.checked
                                    ? 'Email notifications enabled (saved).'
                                    : 'Email notifications disabled (saved).'
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#DC2626]"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Quick Edit Name Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Edit Profile Name</h3>
                    <p className="text-xs text-[#64748B]">Update your public display name</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-slate-100 text-[#64748B] rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ displayName: e.target.value })}
                    placeholder="Enter your name"
                    required
                    autoFocus
                    className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm font-semibold text-[#111827] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626] transition-all"
                  />
                </div>

                {settingsMessage && (
                  <p className="text-xs font-semibold text-[#DC2626]">{settingsMessage}</p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#64748B] font-bold text-xs rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Animated Ticket Modal Overlay */}
        {selectedTicketEvent && (
          <AnimatedTicket
            ticketId={selectedTicketEvent._id}
            amount={Number(selectedTicketEvent.pricing?.amount || 0)}
            date={new Date(selectedTicketEvent.date?.start)}
            cardHolder={user.displayName || user.name || 'Attendee'}
            last4Digits={(user.uid || user.id || '8237').substring(0, 4).toUpperCase()}
            barcodeValue={`${selectedTicketEvent._id.substring(0, 10)}${(user.uid || user.id || '2893').substring(0, 4)}`}
            eventTitle={selectedTicketEvent.title}
            eventLocation={selectedTicketEvent.location?.address || selectedTicketEvent.location?.city || 'Virtual'}
            eventImage={selectedTicketEvent.images?.[0]?.url}
            onClose={() => setSelectedTicketEvent(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
