import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmlink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('farmlink_token')
      localStorage.removeItem('farmlink_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ AUTH ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

// ============ PRODUCTS ============
export const productsAPI = {
  list: (params) => api.get('/products/', { params }),
  get: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  myListings: () => api.get('/products/my/listings'),
}

// ============ ORDERS ============
export const ordersAPI = {
  create: (data) => api.post('/orders/', data),
  list: (params) => api.get('/orders/', { params }),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  assignLogistics: (id, data) => api.put(`/orders/${id}/assign-logistics`, data),
  submitPOD: (id, data) => api.put(`/orders/${id}/proof-of-delivery`, data),
}

// ============ WALLET ============
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  withdraw: (amount) => api.post(`/wallet/withdraw?amount=${amount}`),
}

// ============ CHAT ============
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId, params) => api.get(`/chat/conversations/${conversationId}/messages`, { params }),
  send: (data) => api.post('/chat/send', data),
}

// ============ AGENT ============
export const agentAPI = {
  registerFarmer: (data) => api.post('/agent/farmers', data),
  listFarmers: () => api.get('/agent/farmers'),
  getFarmer: (id) => api.get(`/agent/farmers/${id}`),
  dashboard: () => api.get('/agent/dashboard'),
}

// ============ LOGISTICS ============
export const logisticsAPI = {
  dashboard: () => api.get('/logistics/dashboard'),
  deliveries: (params) => api.get('/logistics/deliveries', { params }),
  accept: (orderId) => api.put(`/logistics/orders/${orderId}/accept`),
  reject: (orderId) => api.put(`/logistics/orders/${orderId}/reject`),
  updateTracking: (orderId, data) => api.put(`/logistics/orders/${orderId}/track`, data),
  updateAvailability: (data) => api.put('/logistics/availability', data),
  updateVehicle: (data) => api.put('/logistics/vehicle', data),
  available: () => api.get('/logistics/available'),
  earnings: () => api.get('/logistics/earnings'),
}

// ============ COMMUNITY ============
export const communityAPI = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (data) => api.post('/community/posts', data),
  likePost: (postId) => api.post(`/community/posts/${postId}/like`),
  sharePost: (postId) => api.post(`/community/posts/${postId}/share`),
  savePost: (postId) => api.post(`/community/posts/${postId}/save`),
  commentPost: (postId, data) => api.post(`/community/posts/${postId}/comment`, data),
  getComments: (postId) => api.get(`/community/posts/${postId}/comments`),
  createReview: (data) => api.post('/community/reviews', data),
  getReceivedReviews: () => api.get('/community/reviews/received'),
}

// ============ ADMIN ============
export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  listUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  transactions: (params) => api.get('/admin/transactions', { params }),
  approveFarmer: (id) => api.put(`/admin/agent-farmers/${id}/approve`),
  rejectFarmer: (id) => api.put(`/admin/agent-farmers/${id}/reject`),
}

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
}

// ============ PRICE ALERTS ============
export const priceAlertsAPI = {
  list: () => api.get('/price-alerts'),
  create: (data) => api.post('/price-alerts', data),
  delete: (id) => api.delete(`/price-alerts/${id}`),
  toggle: (id) => api.put(`/price-alerts/${id}/toggle`),
}

// ============ ADDRESSES ============
export const addressesAPI = {
  list: () => api.get('/addresses'),
  create: (data) => api.post('/addresses', data),
  delete: (id) => api.delete(`/addresses/${id}`),
}

// ============ WISHLIST ============
export const wishlistAPI = {
  list: () => api.get('/wishlist'),
  add: (productId) => api.post(`/wishlist/${productId}`),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
}

// ============ LEADERBOARD ============
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
}

// ============ UPLOAD ============
export const uploadAPI = {
  single: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  multiple: (files) => {
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    return api.post('/upload/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}

// ============ REFERENCE DATA ============
export const referenceAPI = {
  categories: () => api.get('/reference/categories'),
  cropCalendar: () => api.get('/reference/crop-calendar'),
  marketInsights: () => api.get('/reference/market-insights'),
  weather: () => api.get('/reference/weather'),
  qualityAlerts: () => api.get('/reference/quality-alerts'),
  stories: () => api.get('/reference/stories'),
  reels: () => api.get('/reference/reels'),
  faqs: () => api.get('/reference/faqs'),
  badges: () => api.get('/reference/badges'),
  sustainabilityCriteria: () => api.get('/reference/sustainability-criteria'),
  upcomingTasks: () => api.get('/reference/upcoming-tasks'),
  bestPlantingTimes: () => api.get('/reference/best-planting-times'),
  priceHistory: () => api.get('/reference/price-history'),
  adminActivity: () => api.get('/reference/admin-activity'),
}

export default api
