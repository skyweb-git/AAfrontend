import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Calendar, Edit, ShoppingBag, Heart, Settings, LogOut, ArrowLeft, MapPin } from 'lucide-react';
import { artistAuth } from './artist/services/api';
import { usersAPI } from '../services/api';
import { logoutFirebase, auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
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
  const [profileForm, setProfileForm] = useState({ displayName: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [artistProfile, setArtistProfile] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedTicketEvent, setSelectedTicketEvent] = useState(null);

  const isArtist = user?.role === 'artist' || user?.isArtist;

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
      const userToken = localStorage.getItem('authToken');
      if (userToken) {
        try {
          const response = await artistAuth.ssoLogin(userToken);
          if (response.success) {
            setArtistProfile(response.artist);
          }
        } catch (err) {
          console.log('SSO status check: Not a registered artist profile');
        }
      }
    };
    checkArtistStatus();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setSettingsMessage('');
      await updateUser({ displayName: profileForm.displayName.trim() });
      setEditingProfile(false);
      setSettingsMessage('Profile updated successfully.');
    } catch (err) {
      setSettingsMessage(err.message || 'Failed to update profile.');
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
      setSettingsMessage('Password reset email sent. Check your inbox.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const joinDate = (user.createdAt || user.metadata?.creationTime) 
    ? new Date(user.createdAt || user.metadata.creationTime).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      }) 
    : 'Recently';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="flex justify-start mb-6">
          <Link 
            to="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-950 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200/80 font-medium active:scale-95 duration-200"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-800 h-32"></div>
          <div className="px-6 pb-6">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4">
              <div className="relative">
                {user.photoURL ? (
                  <>
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.profile-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div className="profile-placeholder hidden w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg items-center justify-center">
                      <User size={40} className="text-gray-500" />
                    </div>
                  </>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center">
                    <User size={40} className="text-gray-500" />
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.displayName || 'User'}</h1>
                  {artistProfile && (
                    <span className="px-2 py-0.5 text-[9px] font-extrabold bg-red-50 text-red-600 border border-red-200 rounded-full uppercase tracking-wider">
                      Artist Member
                    </span>
                  )}
                </div>
                <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail size={16} />
                  {user.email}
                </p>
                <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Calendar size={14} />
                  Member since {joinDate}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <nav className="flex flex-col">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id 
                          ? 'bg-red-50 text-red-600 border-l-4 border-red-600' 
                          : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Orders</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Favorites</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Reviews</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Overview</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium text-gray-900">{user.displayName || 'Not set'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">User ID</p>
                      <p className="font-medium text-gray-900 text-sm truncate">{user.uid || user.id}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Account Type</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {artistProfile ? (user.role === 'admin' ? 'Admin / Artist' : 'Artist') : (user.role || 'User')}
                      </p>
                    </div>
                  </div>
                  
                  {artistProfile && (
                    <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-600 text-white rounded-lg flex-shrink-0">
                          <User size={24} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">You are a Registered Artist!</h3>
                            <span className="inline-block px-2.5 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-full uppercase tracking-wider">
                              SSO Enabled
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">
                            We detected that your email <strong className="text-gray-900">{user.email}</strong> is registered under our Artist Profiles. 
                            Since you are already logged in to your account, you have direct single sign-on access to manage your works, events, and inbox without needing to login again.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                              to="/artist/dashboard"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                            >
                              Go to Artist Dashboard &rarr;
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500">No recent activity to show.</p>
                      <Link to="/art" className="text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                        Browse Art Store
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">My Tickets & Bookings</h2>
                  {loadingEvents ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                  ) : registeredEvents.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {registeredEvents.map((event) => {
                        return (
                          <div key={event._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start mb-2">
                                <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-600 border border-red-100 rounded-full uppercase tracking-wider">
                                  {event.category}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">
                                  ID: {event._id.substring(12, 24)}
                                </span>
                              </div>
                              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{event.title}</h3>
                              <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-1.5">
                                <Calendar size={14} />
                                <span>{new Date(event.date?.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(event.date?.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              </p>
                              <p className="text-gray-500 text-xs flex items-center gap-1.5 mb-4">
                                <MapPin size={14} />
                                <span className="truncate">{event.location?.address || event.location?.city}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedTicketEvent(event)}
                                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                              >
                                View Ticket
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No tickets or bookings found.</p>
                      <Link to="/events" className="text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                        Browse Upcoming Events
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">My Favorites</h2>
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Heart size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No favorites yet.</p>
                    <Link to="/art" className="text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                      Discover Artworks
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
                  {settingsMessage && (
                    <p className="mb-4 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                      {settingsMessage}
                    </p>
                  )}
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Profile Information</h3>
                      <p className="text-sm text-gray-500 mb-3">Update your account profile details.</p>
                      {isArtist && !editingProfile ? (
                        <button
                          type="button"
                          onClick={() => navigate('/artist-hub')}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Manage artist profile →
                        </button>
                      ) : editingProfile ? (
                        <div className="space-y-3 mt-2">
                          <label className="block text-sm font-medium text-gray-700">Display name</label>
                          <input
                            type="text"
                            value={profileForm.displayName}
                            onChange={(e) => setProfileForm({ displayName: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleSaveProfile}
                              disabled={savingProfile}
                              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              {savingProfile ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProfile(false);
                                setProfileForm({ displayName: user.displayName || user.name || '' });
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingProfile(true)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Edit Profile →
                        </button>
                      )}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Password</h3>
                      <p className="text-sm text-gray-500 mb-3">Change your password or enable 2FA.</p>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Send password reset email →
                      </button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Notifications</h3>
                      <p className="text-sm text-gray-500 mb-3">Manage your email and push notifications.</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => {
                            setEmailNotifications(e.target.checked);
                            setSettingsMessage(
                              e.target.checked
                                ? 'Email notifications enabled (saved locally).'
                                : 'Email notifications disabled (saved locally).'
                            );
                          }}
                          className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700">Email me about messages and orders</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
