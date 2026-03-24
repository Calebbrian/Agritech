/**
 * Data service layer — fetches from API only. No mock data.
 * Maps API responses to the format the UI components expect.
 */
import { productsAPI, ordersAPI, walletAPI, chatAPI, agentAPI, logisticsAPI, communityAPI, adminAPI, referenceAPI, notificationsAPI, priceAlertsAPI, addressesAPI, wishlistAPI, leaderboardAPI, uploadAPI } from './api'

// ===== HELPERS =====
function mapApiProduct(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    unit: p.unit,
    image: p.image_url || p.image_urls || `https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=300&fit=crop`,
    farmer: p.owner_name || 'Unknown Farmer',
    farmerId: p.owner_id,
    location: p.farm_location || p.state || '',
    rating: p.rating || 0,
    reviews: 0,
    stock: p.quantity_available,
    description: p.description || '',
    isOrganic: p.is_organic,
    qualityScore: p.quality_grade === 'Grade A' ? 95 : p.quality_grade === 'Premium' ? 98 : 80,
    verified: p.owner_verified,
    views: p.views || 0,
    totalSold: p.total_sold || 0,
    isGroupDeal: p.is_group_deal,
    groupPrice: p.group_price,
    groupMinBuyers: p.group_min_buyers,
    groupCurrentBuyers: p.group_current_buyers,
    groupDeadline: p.group_deadline,
    listedByAgent: p.listed_by_agent_id,
    createdAt: p.created_at,
  }
}

function mapApiOrder(o) {
  return {
    id: o.id,
    orderId: o.order_number,
    buyer: o.buyer_name || 'Unknown',
    amount: o.total_amount,
    status: o.status,
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-NG') : '',
    items: o.items?.length || 1,
    deliveryAddress: o.delivery_address,
    deliveryFee: o.delivery_fee,
    platformFee: o.platform_fee,
    agentCommission: o.agent_commission,
    subtotal: o.subtotal,
    sellerName: o.seller_name,
    logisticsName: o.logistics_name,
    paymentStatus: o.payment_status,
    podImageUrl: o.pod_image_url,
  }
}

// ===== PRODUCTS =====
export async function fetchProducts(params = {}) {
  try {
    const res = await productsAPI.list(params)
    return res.data.map(mapApiProduct)
  } catch {
    return []
  }
}

export async function fetchProduct(id) {
  try {
    const res = await productsAPI.get(id)
    return mapApiProduct(res.data)
  } catch {
    return null
  }
}

export async function fetchMyProducts() {
  try {
    const res = await productsAPI.myListings()
    return res.data.map(mapApiProduct)
  } catch {
    return []
  }
}

export async function createProduct(data) {
  const res = await productsAPI.create(data)
  return mapApiProduct(res.data)
}

export async function updateProduct(id, data) {
  const res = await productsAPI.update(id, data)
  return mapApiProduct(res.data)
}

export async function deleteProduct(id) {
  await productsAPI.delete(id)
}

// ===== ORDERS =====
export async function fetchOrders(params = {}) {
  try {
    const res = await ordersAPI.list(params)
    return res.data.map(mapApiOrder)
  } catch {
    return []
  }
}

export async function createOrder(data) {
  const res = await ordersAPI.create(data)
  return mapApiOrder(res.data)
}

export async function updateOrderStatus(id, data) {
  const res = await ordersAPI.updateStatus(id, data)
  return mapApiOrder(res.data)
}

export async function assignLogisticsToOrder(orderId, logisticsId) {
  const res = await ordersAPI.assignLogistics(orderId, { logistics_id: logisticsId })
  return res.data
}

// ===== WALLET =====
export async function fetchWalletBalance() {
  try {
    const res = await walletAPI.getBalance()
    return res.data
  } catch {
    return { available: 0, escrow: 0, total_earned: 0 }
  }
}

export async function fetchTransactions(params = {}) {
  try {
    const res = await walletAPI.getTransactions(params)
    return res.data
  } catch {
    return []
  }
}

export async function withdrawFunds(amount) {
  const res = await walletAPI.withdraw(amount)
  return res.data
}

// ===== CHAT =====
export async function fetchConversations() {
  try {
    const res = await chatAPI.getConversations()
    return res.data
  } catch {
    return []
  }
}

export async function fetchMessages(conversationId, params = {}) {
  try {
    const res = await chatAPI.getMessages(conversationId, params)
    return res.data
  } catch {
    return []
  }
}

export async function sendMessage(data) {
  const res = await chatAPI.send(data)
  return res.data
}

// ===== AGENT =====
export async function fetchAgentDashboard() {
  try {
    const res = await agentAPI.dashboard()
    return res.data
  } catch {
    return { total_farmers: 0, verified_farmers: 0, pending_farmers: 0, total_commission: 0, wallet_balance: 0, commission_rate: 10 }
  }
}

export async function fetchAgentFarmers() {
  try {
    const res = await agentAPI.listFarmers()
    return res.data
  } catch {
    return []
  }
}

export async function registerFarmer(data) {
  const res = await agentAPI.registerFarmer(data)
  return res.data
}

// ===== LOGISTICS =====
export async function fetchLogisticsDashboard() {
  try {
    const res = await logisticsAPI.dashboard()
    return res.data
  } catch {
    return { pending_pickups: 0, active_deliveries: 0, completed: 0, total_earned: 0, wallet_balance: 0, is_available: true, rating: 0 }
  }
}

export async function fetchDeliveries(params = {}) {
  try {
    const res = await logisticsAPI.deliveries(params)
    return res.data
  } catch {
    return []
  }
}

export async function fetchAvailableLogistics() {
  try {
    const res = await logisticsAPI.available()
    return res.data
  } catch {
    return []
  }
}

export async function acceptDelivery(orderId) {
  const res = await logisticsAPI.accept(orderId)
  return res.data
}

export async function rejectDelivery(orderId) {
  const res = await logisticsAPI.reject(orderId)
  return res.data
}

// ===== COMMUNITY =====
export async function fetchPosts(params = {}) {
  try {
    const res = await communityAPI.getPosts(params)
    return res.data
  } catch {
    return []
  }
}

export async function createPost(data) {
  const res = await communityAPI.createPost(data)
  return res.data
}

export async function fetchReceivedReviews() {
  try {
    const res = await communityAPI.getReceivedReviews()
    return res.data
  } catch {
    return []
  }
}

export async function toggleLike(postId) {
  const res = await communityAPI.likePost(postId)
  return res.data
}

export async function sharePost(postId) {
  const res = await communityAPI.sharePost(postId)
  return res.data
}

export async function toggleSave(postId) {
  const res = await communityAPI.savePost(postId)
  return res.data
}

export async function addComment(postId, content) {
  const res = await communityAPI.commentPost(postId, { content })
  return res.data
}

export async function fetchComments(postId) {
  const res = await communityAPI.getComments(postId)
  return res.data
}

// ===== ADMIN =====
export async function fetchAdminDashboard() {
  try {
    const res = await adminAPI.dashboard()
    return res.data
  } catch {
    return { total_users: 0, total_orders: 0, total_products: 0, total_revenue: 0, users_by_role: {}, pending_verifications: 0 }
  }
}

export async function fetchAdminUsers(params = {}) {
  try {
    const res = await adminAPI.listUsers(params)
    return res.data
  } catch {
    return []
  }
}

export async function fetchAdminTransactions(params = {}) {
  try {
    const res = await adminAPI.transactions(params)
    return res.data
  } catch {
    return []
  }
}

// ===== REFERENCE DATA =====
export async function fetchCategories() {
  try {
    const res = await referenceAPI.categories()
    return res.data
  } catch {
    return []
  }
}

export async function fetchCropCalendar() {
  try {
    const res = await referenceAPI.cropCalendar()
    return res.data
  } catch {
    return []
  }
}

export async function fetchMarketInsights() {
  try {
    const res = await referenceAPI.marketInsights()
    return res.data
  } catch {
    return []
  }
}

export async function fetchWeatherData() {
  try {
    const res = await referenceAPI.weather()
    return res.data
  } catch {
    return []
  }
}

export async function fetchQualityAlerts() {
  try {
    const res = await referenceAPI.qualityAlerts()
    return res.data
  } catch {
    return []
  }
}

// ===== NOTIFICATIONS =====
export async function fetchNotifications() {
  try { const res = await notificationsAPI.list(); return res.data } catch { return [] }
}
export async function markNotificationRead(id) { await notificationsAPI.markRead(id) }
export async function markAllNotificationsRead() { await notificationsAPI.markAllRead() }
export async function deleteNotification(id) { await notificationsAPI.delete(id) }

// ===== PRICE ALERTS =====
export async function fetchPriceAlerts() {
  try { const res = await priceAlertsAPI.list(); return res.data } catch { return [] }
}
export async function createPriceAlert(data) { const res = await priceAlertsAPI.create(data); return res.data }
export async function deletePriceAlert(id) { await priceAlertsAPI.delete(id) }
export async function togglePriceAlert(id) { const res = await priceAlertsAPI.toggle(id); return res.data }

// ===== ADDRESSES =====
export async function fetchAddresses() {
  try { const res = await addressesAPI.list(); return res.data } catch { return [] }
}
export async function createAddress(data) { const res = await addressesAPI.create(data); return res.data }
export async function deleteAddress(id) { await addressesAPI.delete(id) }

// ===== WISHLIST =====
export async function fetchWishlistAPI() {
  try { const res = await wishlistAPI.list(); return res.data } catch { return [] }
}
export async function addToWishlistAPI(productId) { const res = await wishlistAPI.add(productId); return res.data }
export async function removeFromWishlistAPI(productId) { const res = await wishlistAPI.remove(productId); return res.data }

// ===== LEADERBOARD =====
export async function fetchLeaderboard() {
  try { const res = await leaderboardAPI.get(); return res.data } catch { return [] }
}

// ===== LOGISTICS EARNINGS =====
export async function fetchLogisticsEarnings() {
  try { const res = await logisticsAPI.earnings(); return res.data } catch { return [] }
}

// ===== FILE UPLOAD =====
export async function uploadFile(file) {
  const res = await uploadAPI.single(file)
  return res.data
}
export async function uploadFiles(files) {
  const res = await uploadAPI.multiple(files)
  return res.data
}

// ===== MORE REFERENCE DATA =====
export async function fetchStories() {
  try { const res = await referenceAPI.stories(); return res.data } catch { return [] }
}
export async function fetchReels() {
  try { const res = await referenceAPI.reels(); return res.data } catch { return [] }
}
export async function fetchFaqs() {
  try { const res = await referenceAPI.faqs(); return res.data } catch { return [] }
}
export async function fetchBadges() {
  try { const res = await referenceAPI.badges(); return res.data } catch { return [] }
}
export async function fetchSustainabilityCriteria() {
  try { const res = await referenceAPI.sustainabilityCriteria(); return res.data } catch { return [] }
}
export async function fetchUpcomingTasks() {
  try { const res = await referenceAPI.upcomingTasks(); return res.data } catch { return [] }
}
export async function fetchBestPlantingTimes() {
  try { const res = await referenceAPI.bestPlantingTimes(); return res.data } catch { return [] }
}
export async function fetchPriceHistory() {
  try { const res = await referenceAPI.priceHistory(); return res.data } catch { return [] }
}
export async function fetchAdminActivity() {
  try { const res = await referenceAPI.adminActivity(); return res.data } catch { return [] }
}
