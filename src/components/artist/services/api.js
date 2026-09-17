import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://sverxiioo.nanoprofiles.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('artistToken')
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Clear stale session on auth failure (prevents blank dashboard after refresh)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('artistToken')
      localStorage.removeItem('artistData')
    }
    return Promise.reject(error)
  }
)

// Artist authentication APIs
export const artistAuth = {
  // SSO login using main website user token
  ssoLogin: async (userToken) => {
    const response = await api.post('/artists/login/sso', {}, {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    });
    return response.data;
  },

  // Request OTP for artist login
  requestOTP: async (email) => {
    const response = await api.post('/artists/login/request-otp', { email })
    return response.data
  },

  // Verify OTP and get token
  verifyOTP: async (email, otp) => {
    const response = await api.post('/artists/login/verify-otp', { email, otp })
    return response.data
  },

  // Get current artist profile
  getProfile: async () => {
    const response = await api.get('/artists/me')
    return response.data
  },

  // Update artist profile
  updateProfile: async (data) => {
    const response = await api.put('/artists/me', data)
    return response.data
  },

  // Upload artist image
  uploadImage: async (formData) => {
    const response = await api.post('/artists/me/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export const messagesAPI = {
  // Fetch all messages involving the current artist
  getMessages: async () => {
    const response = await api.get('/messages');
    return response.data;
  },

  // Alias for Dashboard.jsx
  getInbox: async (artistId) => {
    const response = await api.get(`/messages/for-artist/${artistId}`);
    return response.data;
  },

  // Fetch robust grouped conversations
  getConversations: async () => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  // Fetch full history with a partner
  getConversationHistory: async (partnerId) => {
    const response = await api.get(`/messages/conversation/${partnerId}`);
    return response.data;
  },

  // Send a new message
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // Mark a message as read
  markAsRead: async (id) => {
    const response = await api.patch(`/messages/${id}/read`);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (id) => {
    const response = await api.delete(`/messages/${id}`);
    return response.data;
  },
};

export const productsAPI = {
  // Get products (can filter by artist)
  getProducts: async (params) => {
    const response = await api.get('/products', { params })
    return response.data
  },

  // Create new product
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update product
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
}

export default api
