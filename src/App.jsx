import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import FarmerDashboard from './pages/Farmer/FarmerDashboard'
import FarmerProducts from './pages/Farmer/FarmerProducts'
import FarmerOrders from './pages/Farmer/FarmerOrders'
import FarmerInventory from './pages/Farmer/FarmerInventory'
import FarmerAnalytics from './pages/Farmer/FarmerAnalytics'
import FarmerReviews from './pages/Farmer/FarmerReviews'
import FarmerPayouts from './pages/Farmer/FarmerPayouts'
import PriceCompare from './pages/Farmer/PriceCompare'
import HarvestScheduler from './pages/Farmer/HarvestScheduler'
import QualityAlerts from './pages/Farmer/QualityAlerts'
import SustainabilityScore from './pages/Farmer/SustainabilityScore'
import FarmerGroupDeals from './pages/Farmer/FarmerGroupDeals'
import AgentDashboard from './pages/Agent/AgentDashboard'
import AgentFarmers from './pages/Agent/AgentFarmers'
import AgentProducts from './pages/Agent/AgentProducts'
import AgentOrders from './pages/Agent/AgentOrders'
import BuyerDashboard from './pages/Buyer/BuyerDashboard'
import BuyerMarketplace from './pages/Buyer/BuyerMarketplace'
import BuyerCart from './pages/Buyer/BuyerCart'
import BuyerOrders from './pages/Buyer/BuyerOrders'
import BuyerWishlist from './pages/Buyer/BuyerWishlist'
import BuyerReviews from './pages/Buyer/BuyerReviews'
import BuyerAddresses from './pages/Buyer/BuyerAddresses'
import BuyerGroupBuy from './pages/Buyer/BuyerGroupBuy'
import PriceAlerts from './pages/Buyer/PriceAlerts'
import CompareProducts from './pages/Buyer/CompareProducts'
import ProductDetail from './pages/Buyer/ProductDetail'
import LogisticsDashboard from './pages/Logistics/LogisticsDashboard'
import LogisticsDeliveries from './pages/Logistics/LogisticsDeliveries'
import LogisticsEarnings from './pages/Logistics/LogisticsEarnings'
import LogisticsVehicle from './pages/Logistics/LogisticsVehicle'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminUsers from './pages/Admin/AdminUsers'
import AdminTransactions from './pages/Admin/AdminTransactions'
import ChatPage from './pages/Chat/ChatPage'
import WalletPage from './pages/Wallet/WalletPage'
import TrackingPage from './pages/Tracking/TrackingPage'
import NearbyPage from './pages/Tracking/NearbyPage'
import AssignLogistics from './pages/Tracking/AssignLogistics'
import CropAdvisoryPage from './pages/CropAdvisory/CropAdvisoryPage'
import CommunityPage from './pages/Community/CommunityPage'
import NotificationsPage from './pages/Notifications/NotificationsPage'
import ProfilePage from './pages/Profile/ProfilePage'
import HelpPage from './pages/Help/HelpPage'
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage'
import TermsPage from './pages/Legal/TermsPage'
import OnboardingPage from './pages/Onboarding/OnboardingPage'
import SOSButton from './components/SOSButton'
import { useAuth } from './context/AuthContext'

function AppContent() {
  const { user } = useAuth()
  const showSOS = user && (user.role === 'logistics' || user.role === 'farmer' || user.role === 'agent')

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Farmer Routes */}
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/products" element={<FarmerProducts />} />
        <Route path="/farmer/inventory" element={<FarmerInventory />} />
        <Route path="/farmer/orders" element={<FarmerOrders />} />
        <Route path="/farmer/assign-logistics" element={<AssignLogistics />} />
        <Route path="/farmer/analytics" element={<FarmerAnalytics />} />
        <Route path="/farmer/reviews" element={<FarmerReviews />} />
        <Route path="/farmer/payouts" element={<FarmerPayouts />} />
        <Route path="/farmer/price-compare" element={<PriceCompare />} />
        <Route path="/farmer/sustainability" element={<SustainabilityScore />} />
        <Route path="/farmer/group-deals" element={<FarmerGroupDeals />} />
        <Route path="/farmer/messages" element={<ChatPage />} />
        <Route path="/farmer/wallet" element={<WalletPage />} />
        <Route path="/farmer/crop-advisory" element={<CropAdvisoryPage />} />
        <Route path="/farmer/quality" element={<QualityAlerts />} />
        <Route path="/farmer/harvest-scheduler" element={<HarvestScheduler />} />
        <Route path="/farmer/notifications" element={<NotificationsPage />} />
        <Route path="/farmer/profile" element={<ProfilePage />} />
        <Route path="/farmer/help" element={<HelpPage />} />

        {/* Agent Routes */}
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/farmers" element={<AgentFarmers />} />
        <Route path="/agent/products" element={<AgentProducts />} />
        <Route path="/agent/orders" element={<AgentOrders />} />
        <Route path="/agent/messages" element={<ChatPage />} />
        <Route path="/agent/wallet" element={<WalletPage />} />
        <Route path="/agent/assign-logistics" element={<AssignLogistics />} />
        <Route path="/agent/notifications" element={<NotificationsPage />} />
        <Route path="/agent/profile" element={<ProfilePage />} />
        <Route path="/agent/help" element={<HelpPage />} />

        {/* Buyer Routes */}
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/marketplace" element={<BuyerMarketplace />} />
        <Route path="/marketplace" element={<BuyerMarketplace />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/buyer/cart" element={<BuyerCart />} />
        <Route path="/cart" element={<BuyerCart />} />
        <Route path="/buyer/orders" element={<BuyerOrders />} />
        <Route path="/buyer/tracking" element={<TrackingPage />} />
        <Route path="/buyer/wishlist" element={<BuyerWishlist />} />
        <Route path="/buyer/group-buy" element={<BuyerGroupBuy />} />
        <Route path="/buyer/reviews" element={<BuyerReviews />} />
        <Route path="/buyer/addresses" element={<BuyerAddresses />} />
        <Route path="/buyer/price-alerts" element={<PriceAlerts />} />
        <Route path="/buyer/compare" element={<CompareProducts />} />
        <Route path="/buyer/messages" element={<ChatPage />} />
        <Route path="/buyer/wallet" element={<WalletPage />} />
        <Route path="/buyer/nearby" element={<NearbyPage />} />
        <Route path="/buyer/assign-logistics" element={<AssignLogistics />} />
        <Route path="/buyer/notifications" element={<NotificationsPage />} />
        <Route path="/buyer/profile" element={<ProfilePage />} />
        <Route path="/buyer/help" element={<HelpPage />} />

        {/* Logistics Routes */}
        <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
        <Route path="/logistics/deliveries" element={<LogisticsDeliveries />} />
        <Route path="/logistics/earnings" element={<LogisticsEarnings />} />
        <Route path="/logistics/vehicle" element={<LogisticsVehicle />} />
        <Route path="/logistics/messages" element={<ChatPage />} />
        <Route path="/logistics/wallet" element={<WalletPage />} />
        <Route path="/logistics/notifications" element={<NotificationsPage />} />
        <Route path="/logistics/profile" element={<ProfilePage />} />
        <Route path="/logistics/help" element={<HelpPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/profile" element={<ProfilePage />} />

        {/* Shared Routes */}
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>

      {showSOS && <SOSButton />}
    </>
  )
}

export default function App() {
  return <AppContent />
}
