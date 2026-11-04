import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Mail, MapPin, Phone, Globe, Instagram, Facebook,
  Linkedin, Save, Camera, Loader2,
  Briefcase, Image as ImageIcon, Trash2,
  ShoppingBag, Package, IndianRupee, TrendingUp, Lock, Store, ArrowLeft
} from 'lucide-react'
import { artistAuth, productsAPI, ecommerceAPI } from '../services/api'
import { useArtist } from '../context/ArtistContext'
import { Plus, Edit2, ExternalLink, X, Crop } from 'lucide-react'
import ImageCropperModal from '../components/ImageCropperModal'

// Robust Socket URL resolution (matches api.js logic)

const ArtistDashboard = () => {
  const navigate = useNavigate()
  const { artist, logout, updateArtist, isAuthenticated } = useArtist()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState(null)
        const [artworks, setArtworks] = useState([])
  const [loadingArtworks, setLoadingArtworks] = useState(false)
  const [isArtModalOpen, setIsArtModalOpen] = useState(false)
  const [editingArt, setEditingArt] = useState(null)
  const [artFormData, setArtFormData] = useState({
    name: '',
    category: 'Painting',
    description: '',
    status: 'available',
    price: '',
    tags: []
  })
  const [artFiles, setArtFiles] = useState([])
  const [artPreviews, setArtPreviews] = useState([])
  const [cropperModal, setCropperModal] = useState({
    isOpen: false,
    fileIndex: null,
    imageSrc: null,
    fileName: ''
  })
  const fileInputRef = useRef(null)
  const artFilesInputRef = useRef(null)

  // E-Commerce Sales State
  const [ecommerceSales, setEcommerceSales] = useState([])
  const [loadingEcommerce, setLoadingEcommerce] = useState(false)
  const [ecommerceStats, setEcommerceStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalPayout: 0,
    paidCount: 0,
    pendingCount: 0
  })

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
      loadArtworks()
      loadEcommerceSales()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, artist?._id])

  

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

  const loadEcommerceSales = async () => {
    if (!artist?._id) return;
    setLoadingEcommerce(true);
    try {
      const res = await ecommerceAPI.getMyEcommerceSales(artist._id);
      setEcommerceSales(res.sales || []);
      if (res.stats) setEcommerceStats(res.stats);
    } catch (err) {
      console.error('Failed to load e-commerce sales:', err);
    } finally {
      setLoadingEcommerce(false);
    }
  }

    const handleArtFilesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const totalSize = selected.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 8 * 1024 * 1024) {
      alert(`Total size of selected images is ${(totalSize / (1024 * 1024)).toFixed(1)}MB. Limit is 8MB total. Please select smaller images.`);
      e.target.value = '';
      return;
    }

    setArtFiles(selected);
    const previews = selected.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(0) + ' KB',
      isCropped: false
    }));
    setArtPreviews(previews);
  };

  const handleOpenCropper = (index) => {
    if (!artPreviews[index]) return;
    setCropperModal({
      isOpen: true,
      fileIndex: index,
      imageSrc: artPreviews[index].url,
      fileName: artPreviews[index].name
    });
  };

  const handleCropComplete = (croppedFile, croppedPreviewUrl) => {
    if (cropperModal.fileIndex === null) return;
    const index = cropperModal.fileIndex;
    
    // Update artFiles array with the new cropped file
    const newFiles = [...artFiles];
    newFiles[index] = croppedFile;
    setArtFiles(newFiles);

    // Update artPreviews array
    const newPreviews = [...artPreviews];
    newPreviews[index] = {
      file: croppedFile,
      url: croppedPreviewUrl,
      name: croppedFile.name,
      size: (croppedFile.size / 1024).toFixed(0) + ' KB',
      isCropped: true
    };
    setArtPreviews(newPreviews);

    setCropperModal({
      isOpen: false,
      fileIndex: null,
      imageSrc: null,
      fileName: ''
    });
  };

  const handleRemoveArtFile = (index) => {
    const newFiles = artFiles.filter((_, i) => i !== index);
    const newPreviews = artPreviews.filter((_, i) => i !== index);
    setArtFiles(newFiles);
    setArtPreviews(newPreviews);
    if (artFilesInputRef.current) {
      artFilesInputRef.current.value = '';
    }
  };

  const handleArtSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Ensure artistProfile is set
    const dataToSend = {
      ...artFormData,
      price: Number(artFormData.price) || 0,
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
      setArtPreviews([]);
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
      price: '',
      tags: []
    });
    setArtFiles([]);
    setArtPreviews([]);
    setIsArtModalOpen(true);
  }

  const openEditArtModal = (art) => {
    setEditingArt(art);
    setArtFormData({
      name: art.name,
      category: art.category,
      description: art.description,
      status: art.status,
      price: art.price !== undefined && art.price !== null ? art.price : '',
      tags: art.tags || []
    });
    setArtFiles([]);
    setArtPreviews([]);
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
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all border border-gray-200 active:scale-95 duration-200 shadow-2xs"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Artist Dashboard</h1>
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
              onClick={() => {
                setActiveTab('ecommerce');
                loadEcommerceSales();
              }}
              className={`py-4 px-2 font-bold text-sm uppercase tracking-widest border-b-2 transition-all relative ${activeTab === 'ecommerce' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              E-Commerce
              {ecommerceStats.pendingCount > 0 && (
                <span className="absolute top-3 -right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
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

        {activeTab === 'profile' && (
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
        )}

        {activeTab === 'artworks' && (
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
                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                        <div>
                          <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
                          <span className="text-sm font-black text-gray-900">
                            {Number(art.price) > 0 ? `₹${Number(art.price).toLocaleString('en-IN')}` : 'Not set'}
                          </span>
                        </div>
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
                      <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                          <span>Selling Price (₹)</span>
                          {artist?.isEcommerceSeller ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              ✓ E-Commerce Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending Approval
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={artFormData.price}
                            onChange={(e) => setArtFormData({ ...artFormData, price: e.target.value })}
                            placeholder="e.g., 5000"
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:bg-white outline-none transition-all font-semibold"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {artist?.isEcommerceSeller
                            ? "This price will be shown to buyers on ART SHOWCASE and collectors can buy directly."
                            : "Set your price. Once admin approves your e-commerce account, buyers can purchase at this price."}
                        </p>
                      </div>
                    </div>

<div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">
                          {editingArt ? 'Artwork Images' : 'Upload Images *'}
                        </label>
                        {artPreviews.length > 0 && (
                          <button
                            type="button"
                            onClick={() => artFilesInputRef.current?.click()}
                            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                          >
                            <Plus size={14} />
                            <span>Select Different Images</span>
                          </button>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={artFilesInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleArtFilesChange}
                        className="hidden"
                      />

                      {/* If no previews and editingArt has existing images, show them */}
                      {artPreviews.length === 0 && editingArt?.images && editingArt.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2 font-medium">Current Artwork Image:</p>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                            <img
                              src={editingArt.images[0].url}
                              alt={editingArt.name}
                              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{editingArt.name}</p>
                              <p className="text-[11px] text-gray-400">Click below to upload a new image or crop</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dropzone (When no files selected) */}
                      {artPreviews.length === 0 ? (
                        <div
                          onClick={() => artFilesInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center hover:border-black hover:bg-gray-50/70 transition-all cursor-pointer group"
                        >
                          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100 group-hover:scale-105 group-hover:bg-red-50 transition-all">
                            <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-red-600 transition-colors" />
                          </div>
                          <p className="text-sm font-bold text-gray-900">Click to upload artwork image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max 8MB total)</p>
                          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 group-hover:bg-black group-hover:text-white rounded-full text-[11px] font-bold text-gray-600 transition-colors">
                            <Crop size={12} />
                            <span>Preview & Crop Supported</span>
                          </div>
                        </div>
                      ) : (
                        /* Selected Images Preview Grid with Crop & Delete */
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {artPreviews.map((item, idx) => (
                              <div
                                key={idx}
                                className="group relative bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                              >
                                {/* Image Preview Container */}
                                <div className="relative w-full h-48 bg-neutral-900 overflow-hidden flex items-center justify-center">
                                  <img
                                    src={item.url}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                  />
                                  {/* Badge: Cropped vs Original */}
                                  <div className="absolute top-2.5 left-2.5">
                                    <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full shadow-xs ${
                                      item.isCropped
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-black/80 text-white backdrop-blur-xs'
                                    }`}>
                                      {item.isCropped ? '✓ Cropped' : 'Original'}
                                    </span>
                                  </div>
                                </div>

                                {/* Details & Actions Footer */}
                                <div className="p-3 bg-white flex items-center justify-between gap-2 border-t border-gray-100">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-900 truncate" title={item.name}>
                                      {item.name}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                      {item.size}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {/* Crop Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenCropper(idx)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-800 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
                                      title="Crop & Adjust Image"
                                    >
                                      <Crop size={13} />
                                      <span>Crop</span>
                                    </button>

                                    {/* Remove Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveArtFile(idx)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                      title="Remove Image"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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
        )}

        {/* E-Commerce Tab View */}
        {activeTab === 'ecommerce' && (
          <div>
            {!artist?.isEcommerceSeller ? (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto my-6 animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
                  <Lock className="w-10 h-10" />
                </div>
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider rounded-full mb-3">
                  Admin Approval Required
                </span>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  E-Commerce Not Activated
                </h3>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  Admin should need to approve your account so you can activate the E-Commerce page and start selling your artworks.
                </p>
                <div className="bg-gray-50 border border-gray-200/60 rounded-2xl p-5 text-left text-sm text-gray-600 space-y-2 mb-6">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-red-600" />
                    <span>Once approved by admin:</span>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                    <li>Your artworks will feature direct Cashfree checkout for collectors</li>
                    <li>Selling prices will be displayed on ART SHOWCASE and the main Art Store</li>
                    <li>Track all paid transactions, payouts, and customer orders directly on this dashboard</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-400">
                  Please contact the platform administrator to review and activate e-commerce selling for your profile.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header & Seller Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-red-600" />
                        <h2 className="text-xl font-bold text-gray-900">E-Commerce Management</h2>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Track your artwork sales, order payments, and platform payout disbursements.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Approved Platform Seller</span>
                      {artist?.ecommercePayment?.commissionRate > 0 && (
                        <span className="text-emerald-600 font-normal">
                          ({artist.ecommercePayment.commissionRate}% platform fee)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-red-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Sale Products</span>
                  <ShoppingBag size={18} className="text-red-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">
                  {artworks.filter(a => a.status === 'available' && Number(a.price) > 0).length}
                </div>
                <div className="text-xs text-gray-400 mt-1">Active for sale on Showcase</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Orders</span>
                  <Package size={18} className="text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900">{ecommerceStats.totalSales}</div>
                <div className="text-xs text-gray-400 mt-1">{ecommerceStats.paidCount} fulfilled / paid</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Sales</span>
                  <IndianRupee size={18} className="text-gray-400" />
                </div>
                <div className="text-2xl font-black text-gray-900">₹{(ecommerceStats.totalRevenue || 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400 mt-1">Total collected volume</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-green-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Paid Orders</span>
                  <TrendingUp size={18} />
                </div>
                <div className="text-2xl font-black text-emerald-600">{ecommerceStats.paidCount}</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">Completed purchases</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between text-blue-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Payout</span>
                  <IndianRupee size={18} />
                </div>
                <div className="text-2xl font-black text-blue-600">₹{(ecommerceStats.totalPayout || 0).toLocaleString('en-IN')}</div>
                <div className="text-xs text-blue-600 font-medium mt-1">Disbursable earnings</div>
              </div>
            </div>

            {/* Active Artworks on Sale Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-red-600" />
                    <h3 className="font-bold text-gray-900 text-base">Your Artworks Listed For Sale</h3>
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-xs font-extrabold rounded-full border border-red-200">
                      {artworks.filter(a => a.status === 'available' && Number(a.price) > 0).length} Live
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Artworks with an active price appear at the top of ART SHOWCASE with instant Cashfree checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('artworks')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline transition-colors self-start sm:self-auto"
                >
                  Manage in My Artworks &rarr;
                </button>
              </div>

              {artworks.filter(a => a.status === 'available' && Number(a.price) > 0).length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">You don't have any artworks priced for sale yet.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('artworks')}
                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Go to My Artworks to Set Prices &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {artworks.filter(a => a.status === 'available' && Number(a.price) > 0).map((art) => (
                    <div key={art._id} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {art.images?.[0]?.url ? (
                          <img src={art.images[0].url} alt={art.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">Art</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{art.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-emerald-700">₹{Number(art.price).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">Live on Showcase</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Your Sales History</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Purchases made via ART SHOWCASE & profile store</p>
                </div>
                <button
                  onClick={loadEcommerceSales}
                  disabled={loadingEcommerce}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingEcommerce ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingEcommerce ? (
                <div className="py-20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
                </div>
              ) : ecommerceSales.length === 0 ? (
                <div className="py-20 text-center px-4">
                  <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag size={28} />
                  </div>
                  <h4 className="text-base font-bold text-gray-900">No sales transactions yet</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    When collectors purchase your artworks from ART SHOWCASE or your artist profile, your orders will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50/60 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500">
                        <th className="px-5 py-3">Order ID</th>
                        <th className="px-5 py-3">Artwork</th>
                        <th className="px-5 py-3">Collector</th>
                        <th className="px-5 py-3 text-right">Gross Price</th>
                        <th className="px-5 py-3 text-right">Your Payout</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ecommerceSales.map((sale) => (
                        <tr key={sale._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-gray-600 font-bold">
                            {sale.orderId}
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-900">
                            {sale.productName || 'Artwork'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">{sale.buyerName}</div>
                            <div className="text-xs text-gray-400">{sale.buyerEmail} {sale.buyerPhone ? `• ${sale.buyerPhone}` : ''}</div>
                          </td>
                          <td className="px-5 py-4 text-right font-black text-gray-900">
                            ₹{Number(sale.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-right font-black text-emerald-600">
                            ₹{Number(sale.artistPayoutAmount || sale.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              sale.status === 'paid' || sale.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : sale.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperModal.isOpen}
        imageSrc={cropperModal.imageSrc}
        fileName={cropperModal.fileName}
        onCropComplete={handleCropComplete}
        onCancel={() =>
          setCropperModal({
            isOpen: false,
            fileIndex: null,
            imageSrc: null,
            fileName: ''
          })
        }
      />
    </div>
  )
}

export default ArtistDashboard
