import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, MapPin, Phone, Globe, Instagram, Facebook,
  Linkedin, Save, LogOut, Camera, Loader2, Home,
  Briefcase, Image as ImageIcon, MessageSquare, Trash2
} from 'lucide-react'
import { artistAuth, messagesAPI, productsAPI } from '../services/api'
import { useArtist } from '../context/ArtistContext'
import ArtistChatWindow from '../components/ArtistChatWindow'
import { io } from 'socket.io-client'
import { Plus, Edit2, ExternalLink, X } from 'lucide-react'

// Robust Socket URL resolution (matches api.js logic)
const resolveSocketUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL.replace(/\/api$/, '');
  return 'https://sverxiioo.nanoprofiles.com';
};

const SOCKET_URL = resolveSocketUrl();

const ArtistDashboard = () => {
  const navigate = useNavigate()
  const { artist, logout, updateArtist, isAuthenticated } = useArtist()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState(null)
  const [dms, setDms] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loadingArtworks, setLoadingArtworks] = useState(false)
  const [isArtModalOpen, setIsArtModalOpen] = useState(false)
  const [editingArt, setEditingArt] = useState(null)
  const [artFormData, setArtFormData] = useState({
    name: '',
    category: 'Painting',
    description: '',
    status: 'available',
    tags: []
  })
  const [artFiles, setArtFiles] = useState([])
  const fileInputRef = useRef(null)
  const artFilesInputRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/artist/login')
      return
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated && artist?._id) {
      loadMessages()
      loadArtworks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, artist?._id])

  // ── Global Socket for Inbox Updates ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !artist?._id) return;

    const myId = artist._id;
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Artist Dashboard Socket Connected:', socket.id);
      socket.emit('join_conversation', `user_${myId}`);
    });

    socket.on('new_message_notification', (newMsg) => {
      console.log('🔔 Artist: New message notification for inbox:', newMsg);
      // Refresh inbox list
      loadMessages();
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, artist?._id]);

  const loadProfile = async () => {
    try {
      setLoadError('')
      const response = await artistAuth.getProfile()
      if (response.success) {
        setFormData(response.data)
        updateArtist(response.data)
      } else {
        setLoadError(response.message || 'Failed to load profile')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      const status = err.response?.status
      if (status === 401 || status === 403) {
        logout()
        navigate('/artist/login')
        return
      }
      setLoadError(err.response?.data?.message || 'Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!artist?._id) {
      console.warn('Artist ID not found, skipping message load');
      return;
    }
    console.log('Loading messages for artist:', artist._id);
    setLoadingMessages(true);
    try {
      const data = await messagesAPI.getInbox(artist._id);
      setDms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }

  const loadArtworks = async () => {
    if (!artist?._id) return;
    setLoadingArtworks(true);
    try {
      // Use artistProfile filter as that's what's linked in the Product model
      const response = await productsAPI.getProducts({ artistProfile: artist._id, status: 'all' });
      setArtworks(response.products || []);
    } catch (err) {
      console.error('Failed to load artworks:', err);
    } finally {
      setLoadingArtworks(false);
    }
  }

  const handleArtSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Ensure artistProfile is set
    const dataToSend = {
      ...artFormData,
      artistProfile: artist?._id
    };

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('productData', JSON.stringify(dataToSend));

    if (artFiles.length > 0) {
      Array.from(artFiles).forEach(file => {
        formDataToSubmit.append('images', file);
      });
    }

    try {
      if (editingArt) {
        await productsAPI.updateProduct(editingArt._id, formDataToSubmit);
        setMessage({ type: 'success', text: 'Artwork updated successfully!' });
      } else {
        // Double check limit before posting
        if (artworks.length >= 3) {
          setMessage({ type: 'error', text: 'Upload limit reached: Each artist can upload a maximum of 3 artworks.' });
          setSaving(false);
          return;
        }
        await productsAPI.createProduct(formDataToSubmit);
        setMessage({ type: 'success', text: 'Artwork posted successfully!' });
      }

      setIsArtModalOpen(false);
      setEditingArt(null);
      setArtFiles([]);
      loadArtworks();
    } catch (err) {
      console.error('Failed to save artwork:', err);
      console.error('Save artwork API detailed error response:', err.response?.data);
      const detailedMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to save artwork';
      setMessage({ type: 'error', text: detailedMsg });
    } finally {
      setSaving(false);
    }
  }

  const handleDeleteArt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;

    try {
      await productsAPI.deleteProduct(id);
      setMessage({ type: 'success', text: 'Artwork deleted successfully' });
      loadArtworks();
    } catch (err) {
      console.error('Failed to delete artwork:', err);
      setMessage({ type: 'error', text: 'Failed to delete artwork' });
    }
  }

  const openAddArtModal = () => {
    if (artworks.length >= 3) {
      setMessage({
        type: 'error',
        text: 'Upload limit reached: You have already uploaded 3 artworks. Please delete an existing artwork if you want to post a new one.'
      });
      // Scroll to message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setEditingArt(null);
    setArtFormData({
      name: '',
      category: 'Painting',
      description: '',
      status: 'available',
      tags: []
    });
    setArtFiles([]);
    setIsArtModalOpen(true);
  }

  const openEditArtModal = (art) => {
    setEditingArt(art);
    setArtFormData({
      name: art.name,
      category: art.category,
      description: art.description,
      status: art.status,
      tags: art.tags || []
    });
    setArtFiles([]);
    setIsArtModalOpen(true);
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...(prev?.[parent] || {}), [field]: value }
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image exceeds 2MB limit. Please upload a smaller file.' });
      return;
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    const formDataImg = new FormData()
    formDataImg.append('image', file)

    try {
      const response = await artistAuth.uploadImage(formDataImg)
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          image: { url: response.url, alt: prev.name || 'Artist image' }
        }))
        if (response.data) {
          updateArtist(response.data)
        }
        setMessage({ type: 'success', text: 'Image uploaded successfully' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload image' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await artistAuth.updateProfile(formData)
      if (response.success) {
        updateArtist(response.data)
        setMessage({ type: 'success', text: 'Profile saved successfully!' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  /* eslint-disable-next-line no-unused-vars */
  const handleDeleteMessage = async (id) => {
    try {
      await messagesAPI.deleteMessage(id);
      setDms(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  /* eslint-disable-next-line no-unused-vars */
  const handleMarkAsRead = async (id) => {
    try {
      await messagesAPI.markAsRead(id);
      setDms(prev => prev.map(m => (m._id || m.id) === id ? { ...m, status: 'read' } : m));
    } catch (err) {
      console.error('Mark as read failed:', err);
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/artist/login')
  }

  /* eslint-disable-next-line no-unused-vars */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-gray-50">
        <p className="text-gray-700 text-center max-w-md">
          {loadError || 'Could not load your profile.'}
        </p>
        <button
          type="button"
          onClick={() => { logout(); navigate('/artist/login') }}
          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Artist Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 font-bold text-sm uppercase tracking-widest border-b-2 transition-all ${activeTab === 'profile' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('artworks')}
              className={`py-4 px-2 font-bold text-sm uppercase tracking-widest border-b-2 transition-all ${activeTab === 'artworks' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              My Artworks
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-2 font-bold text-sm uppercase tracking-widest border-b-2 transition-all relative ${activeTab === 'messages' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              Messages
              {dms.length > 0 && (
                <span className="absolute top-3 -right-2 w-2 h-2 bg-red-600 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
            {message.type === 'success' ? <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> : null}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Image</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={formData.image?.url || '/default-avatar.png'}
                    alt={formData.name}
                    className="w-24 h-24 rounded-full object-cover bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Click the camera icon to upload a new photo</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      title="Email cannot be changed. Contact admin for assistance."
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email is read-only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Art Form</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.artForm || ''}
                      onChange={(e) => handleChange('artForm', e.target.value)}
                      placeholder="e.g., Painter, Sculptor"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Username / Public Profile URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Public Profile Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none">@</span>
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_]/g, ''))}
                      placeholder="e.g., udaymicroartist"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                    />
                  </div>
                  {formData.username ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span>✓ Your public profile URL:</span>
                      <a
                        href={`/${formData.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline hover:text-green-700"
                      >
                        artartist.in/{formData.username}
                      </a>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Set a username to get a clean shareable link like <span className="font-mono">artartist.in/yourname</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location?.city || ''}
                      onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.location?.state || ''}
                    onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.location?.country || ''}
                    onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Biography</h2>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={4}
                placeholder="Tell us about yourself and your art..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Social Links</h2>
              
              <div className="space-y-4">
                {/* Instagram */}
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-600" />
                  <input
                    type="text"
                    value={formData.social?.instagram || ''}
                    onChange={(e) => handleNestedChange('social', 'instagram', e.target.value)}
                    placeholder="Instagram ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-sm placeholder-gray-400 text-gray-800 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Facebook */}
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <input
                    type="text"
                    value={formData.social?.facebook || ''}
                    onChange={(e) => handleNestedChange('social', 'facebook', e.target.value)}
                    placeholder="Facebook ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-sm placeholder-gray-400 text-gray-800 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* X */}
                <div className="relative">
                  <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black fill-current">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <input
                    type="text"
                    value={formData.social?.twitter || ''}
                    onChange={(e) => handleNestedChange('social', 'twitter', e.target.value)}
                    placeholder="X ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-sm placeholder-gray-400 text-gray-800 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* LinkedIn */}
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
                  <input
                    type="text"
                    value={formData.social?.linkedin || ''}
                    onChange={(e) => handleNestedChange('social', 'linkedin', e.target.value)}
                    placeholder="LinkedIn ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-sm placeholder-gray-400 text-gray-800 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Website */}
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.social?.website || ''}
                    onChange={(e) => handleNestedChange('social', 'website', e.target.value)}
                    placeholder="Website URL"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300 text-sm placeholder-gray-400 text-gray-800 shadow-sm hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        ) : activeTab === 'artworks' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Artwork Gallery</h2>
                <p className="text-sm text-gray-500">Manage and showcase your creations</p>
              </div>
              <button
                onClick={openAddArtModal}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Post New Art
              </button>
            </div>

            {loadingArtworks ? (
              <div className="flex items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No artworks yet</h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start sharing your amazing work with the world. Your posts will appear on the Art Page and your public profile.</p>
                <button
                  onClick={openAddArtModal}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                  Upload Your First Art
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((art) => (
                  <div key={art._id} className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-square bg-gray-100">
                      {art.images && art.images.length > 0 ? (
                        <img
                          src={art.images[0].url}
                          alt={art.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${art.status === 'available' ? 'bg-green-100 text-green-700' :
                            art.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {art.status}
                        </span>
                        <span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                          {art.category}
                        </span>
                      </div>

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEditArtModal(art)}
                          className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          title="Edit Artwork"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteArt(art._id)}
                          className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                          title="Delete Artwork"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <a
                          href={`/art`} // Link to art showcase
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                          title="View on Site"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 group-hover:text-black transition-colors truncate">{art.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mt-1 min-h-[40px]">{art.description}</p>
                      <div className="mt-4 flex items-center justify-end border-t border-gray-50 pt-4">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Views</span>
                            <span className="text-sm font-bold text-gray-700">{art.views || 0}</span>
                          </div>
                          <div className="text-center">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Likes</span>
                            <span className="text-sm font-bold text-gray-700">{Array.isArray(art.likes) ? art.likes.length : 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Post/Edit Artwork Modal */}
            {isArtModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsArtModalOpen(false)} />
                <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">{editingArt ? 'Edit Artwork' : 'Post New Artwork'}</h2>
                      <p className="text-sm text-gray-500">Fill in the details about your creation</p>
                    </div>
                    <button
                      onClick={() => setIsArtModalOpen(false)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleArtSubmit} className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Artwork Name *</label>
                        <input
                          type="text"
                          required
                          value={artFormData.name}
                          onChange={(e) => setArtFormData({ ...artFormData, name: e.target.value })}
                          placeholder="e.g., Whispers of the Ocean"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Category *</label>
                        <select
                          required
                          value={artFormData.category}
                          onChange={(e) => setArtFormData({ ...artFormData, category: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                        >
                          <option value="Painting">Painting</option>
                          <option value="Digital Art">Digital Art</option>
                          <option value="Sculpture">Sculpture</option>
                          <option value="Photography">Photography</option>
                          <option value="Print">Print</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={artFormData.description}
                        onChange={(e) => setArtFormData({ ...artFormData, description: e.target.value })}
                        placeholder="Tell the story behind this artwork..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Status</label>
                        <select
                          value={artFormData.status}
                          onChange={(e) => setArtFormData({ ...artFormData, status: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all"
                        >
                          <option value="available">Available</option>
                          <option value="sold">Sold</option>
                          <option value="reserved">Reserved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                        {editingArt ? 'Replace Images (Optional)' : 'Upload Images *'}
                      </label>
                      <div
                        onClick={() => artFilesInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-black hover:bg-gray-50 transition-all cursor-pointer group"
                      >
                        <input
                          ref={artFilesInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          required={!editingArt}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const totalSize = files.reduce((acc, f) => acc + f.size, 0);
                            
                            if (totalSize > 4 * 1024 * 1024) {
                              alert(`Total size of selected images is ${(totalSize / (1024 * 1024)).toFixed(1)}MB. Vercel limits uploads to 4.5MB total. Please select fewer or smaller images.`);
                              e.target.value = '';
                              setArtFiles([]);
                              return;
                            }

                            const largeFiles = files.filter(f => f.size > 2 * 1024 * 1024);
                            if (largeFiles.length > 0) {
                              alert(`One or more files exceed the 2MB per file limit: ${largeFiles.map(f => f.name).join(', ')}.`);
                              e.target.value = '';
                              setArtFiles([]);
                              return;
                            }
                            setArtFiles(e.target.files);
                          }}
                          className="hidden"
                        />
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:text-black transition-colors" />
                        <p className="text-sm font-bold text-gray-900">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-2">PNG, JPG or WEBP (Max 4MB total for all images)</p>
                      </div>
                      {artFiles.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {Array.from(artFiles).map((file, i) => (
                            <div key={i} className="px-3 py-1 bg-black text-white rounded-full text-[10px] font-bold">
                              {file.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </form>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsArtModalOpen(false)}
                      className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleArtSubmit}
                      disabled={saving}
                      className="bg-black text-white px-10 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {editingArt ? 'Updating...' : 'Posting...'}
                        </>
                      ) : (
                        editingArt ? 'Update Artwork' : 'Post Artwork'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 h-[700px]">
            {/* Sidebar: Conversations */}
            <div className="w-full md:w-80 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest">Inbox</h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{dms.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loadingMessages ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-300 mx-auto" />
                  </div>
                ) : dms.length === 0 ? (
                  <div className="py-20 text-center px-4">
                    <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">No messages yet</p>
                  </div>
                ) : (
                  (() => {
                    const conversationsMap = {};
                    dms.forEach(dm => {
                      const senderIdStr = (dm.sender?._id || dm.sender)?.toString();
                      const myArtistIdStr = (artist?._id || artist?.id)?.toString();
                      const myUserIdStr = artist?.userId?.toString();

                      const isMeSender = dm.senderType === 'artist' || 
                                         senderIdStr === myArtistIdStr || 
                                         (myUserIdStr && senderIdStr === myUserIdStr);

                      const partner = isMeSender ? dm.recipient : dm.sender;
                      if (!partner?._id) return;

                      if (!conversationsMap[partner._id] || new Date(dm.createdAt) > new Date(conversationsMap[partner._id].lastMessage.createdAt)) {
                        conversationsMap[partner._id] = {
                          partner,
                          lastMessage: dm
                        };
                      }
                    });

                    const conversationList = Object.values(conversationsMap).sort((a, b) =>
                      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
                    );

                    return conversationList.map((conv) => {
                      const { partner, lastMessage } = conv;
                      const isSelected = selectedConversation?.partner?._id === partner._id;

                      return (
                        <div
                          key={partner._id}
                          onClick={() => setSelectedConversation({ partner })}
                          className={`p-4 cursor-pointer border-b border-gray-50 transition-all hover:bg-gray-50 ${isSelected ? 'bg-black text-white' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                              {partner.photoURL || partner.image?.url ? (
                                <img src={partner.photoURL || partner.image?.url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-bold uppercase text-xs">
                                  {(partner.displayName || partner.name || 'C')[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                                <span>
                                   {(partner.email === 'artartistofficial@gmail.com' || partner.email === 'artartistdata@gmail.com' || partner.displayName === 'ArtArtist' || partner.name === 'ArtArtist') 
                                     ? 'ArtArtist' 
                                     : (partner.displayName || partner.name || 'Collector')}
                                 </span>
                                 {(partner.email === 'artartistofficial@gmail.com' || partner.email === 'artartistdata@gmail.com' || partner.displayName === 'ArtArtist' || partner.name === 'ArtArtist') && (
                                   <svg className="w-4 h-4 fill-[#0095f6] flex-shrink-0 inline-block align-middle" viewBox="0 0 24 24" aria-label="Verified account">
                                     <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.512 1.5 12 1.5s-2.77 1.015-3.412 2.285C8.171 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.412 5.28 3.412 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275C9.23 21.485 10.488 22.5 12 22.5s2.77-1.015 3.412-2.285c.418.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.43l-4.24-4.24 1.41-1.41 2.83 2.82 7.07-7.07 1.41 1.41-8.48 8.49z"></path>
                                   </svg>
                                 )}
                              </h4>
                              <p className={`text-xs truncate ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {lastMessage.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            {/* Main: Chat Window */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <ArtistChatWindow
                  currentUser={artist}
                  partnerId={selectedConversation.partner?._id}
                  partnerName={selectedConversation.partner?.displayName || selectedConversation.partner?.name}
                  partnerImage={selectedConversation.partner?.photoURL || selectedConversation.partner?.image?.url}
                  partnerEmail={selectedConversation.partner?.email}
                  onNewMessage={(msg) => {
                    setDms(prev => [msg, ...prev]);
                  }}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-gray-50/30">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                    <MessageSquare size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Artist Inbox</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-xs">
                    Select a collector from the sidebar to view the full conversation and reply in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ArtistDashboard
