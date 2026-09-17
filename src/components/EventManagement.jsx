import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Calendar, DollarSign, Image as ImageIcon, Save, X, Search, RefreshCw, ShieldAlert, MapPin, Users } from 'lucide-react';
import Navbar from './Navbar';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const EMPTY_FORM = {
  title: '',
  description: '',
  category: 'exhibition',
  startDate: '',
  endDate: '',
  locationType: 'physical',
  locationAddress: '',
  locationCity: '',
  pricingType: 'paid',
  pricingAmount: '',
  capacityMax: '',
  status: 'published'
};

const categories = ['Exhibition', 'Workshop', 'Networking', 'Auction', 'Festival', 'Webinar', 'Meetup'];

const EventManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Admin-only gate
  const isAdmin = user?.role === 'admin';

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // status='all' fetches everything for admin
      const res = await eventsAPI.getEvents({ search: search || undefined, status: filterStatus || 'all', category: filterCategory ? filterCategory.toLowerCase() : undefined, limit: 100 });
      setEvents(res.events || []);
    } catch (e) {
      setError('Failed to load events. Check your connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterCategory]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openAddForm = () => {
    setEditingEvent(null);
    setFormData({
       ...EMPTY_FORM, 
       startDate: new Date().toISOString().slice(0,16), 
       endDate: new Date(Date.now() + 86400000).toISOString().slice(0,16) 
    });
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title || '',
      description: evt.description || '',
      category: evt.category || 'exhibition',
      startDate: evt.date?.start ? new Date(evt.date.start).toISOString().slice(0,16) : '',
      endDate: evt.date?.end ? new Date(evt.date.end).toISOString().slice(0,16) : '',
      locationType: evt.location?.type || 'physical',
      locationAddress: evt.location?.address || '',
      locationCity: evt.location?.city || '',
      pricingType: evt.pricing?.type || 'paid',
      pricingAmount: evt.pricing?.amount || '',
      capacityMax: evt.capacity?.max || '',
      status: evt.status || 'published'
    });
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setShowForm(false);
    setEditingEvent(null);
    setFormData(EMPTY_FORM);
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) return setError('Event title is required.');
    if (!formData.description.trim()) return setError('Description is required.');
    if (!formData.startDate || !formData.endDate) return setError('Start and End dates are required.');
    
    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.toLowerCase(),
        date: {
          start: new Date(formData.startDate),
          end: new Date(formData.endDate)
        },
        location: {
          type: formData.locationType,
          address: formData.locationAddress.trim(),
          city: formData.locationCity.trim()
        },
        pricing: {
          type: formData.pricingType,
          amount: formData.pricingType === 'paid' ? Number(formData.pricingAmount) : 0,
          currency: 'INR'
        },
        capacity: {
          max: Number(formData.capacityMax) || 100,
          current: editingEvent ? editingEvent.capacity?.current || 0 : 0
        },
        status: formData.status
      };

      if (editingEvent) {
        await eventsAPI.updateEvent(editingEvent._id, payload, imageFiles.length ? imageFiles : undefined);
        setSuccess('Event updated successfully!');
      } else {
        await eventsAPI.createEvent(payload, imageFiles.length ? imageFiles : undefined);
        setSuccess('Event created successfully!');
      }
      closeForm();
      fetchEvents();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to save event.';
      setError(msg);
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.deleteEvent(eventId);
      setSuccess('Event deleted.');
      fetchEvents();
    } catch (e) {
      setError('Failed to delete event.');
    }
  };

  // If not admin, show access denied
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <ShieldAlert size={64} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Only</h2>
          <p className="text-gray-600 mb-6">Only administrators can manage events.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
          <ShieldAlert size={64} className="text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in as admin to manage events.</p>
          <button onClick={() => navigate('/login')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600 mt-1">Manage exhibitions, workshops, and networking events</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchEvents}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Event
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X size={16} /></button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
          </select>
        </div>

        <p className="text-sm text-gray-500 mb-4">{events.length} event{events.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <Calendar size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-1">No Events Found</h3>
            <p className="text-gray-500 mb-6">Start by creating your first event.</p>
            <button
              onClick={openAddForm}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={18} className="inline mr-2" />
              Add Your First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const imageUrl = event?.images?.[0]?.url;
              return (
                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {imageUrl ? (
                      <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={40} />
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full ${
                      event.status === 'published' ? 'bg-green-100 text-green-700' :
                      event.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.status || 'published'}
                    </span>
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold rounded-full capitalize">
                      {event.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {new Date(event.date?.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span className="truncate capitalize">{event.location?.type} - {event.location?.city || 'Online'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-gray-400" />
                        {event.capacity?.current || 0} / {event.capacity?.max || '∞'} Attendees
                      </div>
                    </div>

                    <p className="text-red-600 font-bold text-lg mb-4 mt-auto">
                      {event.pricing?.type === 'paid' ? `₹${event.pricing?.amount}` : <span className="capitalize">{event.pricing?.type}</span>}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(event)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="absolute inset-0" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Summer Art Exhibition"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      {categories.map(c => <option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="Describe what the event is about..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Attendance */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Location & Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                    <select
                      name="locationType"
                      value={formData.locationType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value="physical">Physical</option>
                      <option value="virtual">Virtual</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity (Optional)</label>
                    <input
                      type="number"
                      name="capacityMax"
                      value={formData.capacityMax}
                      onChange={handleInputChange}
                      placeholder="e.g. 100"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  {formData.locationType !== 'virtual' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          name="locationAddress"
                          value={formData.locationAddress}
                          onChange={handleInputChange}
                          placeholder="e.g. 123 Gallery Street"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          name="locationCity"
                          value={formData.locationCity}
                          onChange={handleInputChange}
                          placeholder="e.g. Mumbai"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Type</label>
                    <select
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    >
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="donation">Donation</option>
                    </select>
                  </div>
                  {formData.pricingType === 'paid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (₹)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="number"
                          name="pricingAmount"
                          value={formData.pricingAmount}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Image */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 border-b pb-2">Event Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="event-img-upload"
                  />
                  <label htmlFor="event-img-upload" className="flex flex-col items-center cursor-pointer">
                    <ImageIcon size={36} className="text-gray-300 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Click to upload event banner</span>
                    <span className="text-xs text-gray-400 mt-1">Recommended: 1200 x 630px</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-24 h-16 object-cover rounded-lg border shadow-sm" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 shadow-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {editingEvent?.images?.length > 0 && imagePreviews.length === 0 && (
                  <div className="text-xs text-gray-500 flex items-center">
                    Current images will be kept unless you upload new ones.
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-red-600 font-medium text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-60"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
