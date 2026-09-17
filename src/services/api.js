import axios from 'axios';

// API Configuration
// For Vercel deployment - set this in your environment variables
const normalizeApiBaseUrl = (url) => {
  if (!url) return url;
  const trimmed = String(url).trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const resolveApiBaseUrl = () => {
  // Priority 1: Check environment variable
  const envBaseUrl = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // Priority 2: New Production URL
  return normalizeApiBaseUrl('https://sverxiioo.nanoprofiles.com/api');
};

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for slower connections
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache', // Prevent caching issues
    'Pragma': 'no-cache',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (firebaseToken) => {
    const response = await api.post('/auth/login', {}, {
      headers: { Authorization: `Bearer ${firebaseToken}` }
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  logout: async (firebaseToken) => {
    const response = await api.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${firebaseToken}` }
    });
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData, images) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    
    if (images && images.length > 0) {
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
    }

    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (id, productData, images) => {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  likeProduct: async (id) => {
    const response = await api.post(`/products/${id}/like`);
    return response.data;
  },

  addReview: async (id, reviewData) => {
    const response = await api.post(`/products/${id}/reviews`, reviewData);
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData, images) => {
    const formData = new FormData();
    formData.append('eventData', JSON.stringify(eventData));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateEvent: async (id, eventData, images) => {
    const formData = new FormData();
    formData.append('eventData', JSON.stringify(eventData));
    
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await api.put(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  registerForEvent: async (id) => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  unregisterFromEvent: async (id) => {
    const response = await api.delete(`/events/${id}/register`);
    return response.data;
  },

  addEventReview: async (id, reviewData) => {
    const response = await api.post(`/events/${id}/reviews`, reviewData);
    return response.data;
  },
};

// Forms API (event registration forms)
export const formsAPI = {
  // Get form for an event (public)
  getEventForm: async (eventId) => {
    const response = await api.get(`/forms/event/${eventId}`);
    return response.data;
  },
  
  // Submit form for an event (public)
  submitForm: async (eventId, formData) => {
    const response = await api.post(`/forms/event/${eventId}/submit`, formData);
    return response.data;
  },

  // Subscribe to event notifications (public)
  subscribeToEvents: async (data) => {
    const response = await api.post('/forms/subscribers', data);
    return response.data;
  },
};

// Waitlist API
export const waitlistAPI = {
  join: async (data) => {
    // We'll use the subscribers endpoint but tagged as 'marketplace_waitlist'
    const response = await api.post('/forms/subscribers', {
      ...data,
      source: 'marketplace_waitlist',
      timestamp: new Date().toISOString()
    });
    return response.data;
  }
};

// Gallery API
export const galleryAPI = {
  getGallery: async (params = {}) => {
    const response = await api.get('/gallery', { params });
    return response.data;
  },
};

export const artistsAPI = {
  searchArtists: async (params = {}) => {
    const response = await api.get('/artists/search', { params });
    return response.data;
  },
  getTeamArtists: async (params = {}) => {
    const response = await api.get('/artists/team', { params });
    return response.data;
  },
  getArtistCountSummary: async () => {
    const response = await api.get('/artists/count/summary');
    return response.data;
  },
  getArtist: async (id) => {
    const response = await api.get(`/artists/${id}`);
    return response.data;
  }
};

export const settingsAPI = {
  getPublicSettings: async () => {
    const response = await api.get('/settings/public');
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  getUserProducts: async (params = {}) => {
    const response = await api.get('/users/products', { params });
    return response.data;
  },

  getUserEvents: async (params = {}) => {
    const response = await api.get('/users/events', { params });
    return response.data;
  },

  getRegisteredEvents: async (params = {}) => {
    const response = await api.get('/users/registered-events', { params });
    return response.data;
  },

  getLikedProducts: async (params = {}) => {
    const response = await api.get('/users/liked-products', { params });
    return response.data;
  },

  searchUsers: async (params = {}) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  },
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
  getConversationHistory: async (partnerId) => {
    const response = await api.get(`/messages/conversation/${partnerId}`);
    return response.data;
  },
  getMessagesForArtist: async (artistId) => {
    const response = await api.get(`/messages/for-artist/${artistId}`);
    return response.data;
  }
};

// Upload API
export const uploadAPI = {
  uploadImage: async (image) => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadImages: async (images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (publicId) => {
    const response = await api.delete(`/upload/image/${publicId}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getProducts: async (params = {}) => {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  getEvents: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    const response = await api.put(`/admin/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },
};

export default api;
