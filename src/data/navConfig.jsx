import {
  LayoutDashboard, Package, ClipboardList, Truck, Users,
  MessageSquare, Wallet, MapPin, Calendar, Newspaper, AlertTriangle,
  Navigation, ShoppingCart, Store, BarChart3, Star, DollarSign,
  Heart, MapPinned, Bell, User, HelpCircle, Boxes, TrendingUp, Car,
  Handshake, Trophy, Leaf, Scale, ShoppingBag, Shield, FileText, GitCompare, BellRing, Sprout
} from 'lucide-react'

export function getDashboardNav(role) {
  const common = [
    { path: `/${role === 'buyer' ? 'buyer' : role}/messages`, label: 'Messages', icon: <MessageSquare size={20} /> },
    { path: `/${role === 'buyer' ? 'buyer' : role}/wallet`, label: 'Wallet', icon: <Wallet size={20} /> },
    { path: `/${role === 'buyer' ? 'buyer' : role}/notifications`, label: 'Notifications', icon: <Bell size={20} /> },
    { path: '/community', label: 'Community', icon: <Newspaper size={20} /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
    { path: `/${role === 'buyer' ? 'buyer' : role}/profile`, label: 'Profile', icon: <User size={20} /> },
    { path: `/${role === 'buyer' ? 'buyer' : role}/help`, label: 'Help', icon: <HelpCircle size={20} /> },
    { path: '/terms', label: 'Legal', icon: <Scale size={20} /> },
  ]

  const navs = {
    farmer: [
      { path: '/farmer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/farmer/products', label: 'My Products', icon: <Package size={20} /> },
      { path: '/farmer/inventory', label: 'Inventory', icon: <Boxes size={20} /> },
      { path: '/farmer/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
      { path: '/farmer/assign-logistics', label: 'Assign Logistics', icon: <Truck size={20} /> },
      { path: '/farmer/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
      { path: '/farmer/reviews', label: 'Reviews', icon: <Star size={20} /> },
      { path: '/farmer/payouts', label: 'Payouts', icon: <DollarSign size={20} /> },
      { path: '/farmer/price-compare', label: 'Price Compare', icon: <TrendingUp size={20} /> },
      { path: '/farmer/group-deals', label: 'Group Deals', icon: <ShoppingBag size={20} /> },
      { path: '/farmer/sustainability', label: 'Sustainability', icon: <Leaf size={20} /> },
      { path: '/farmer/crop-advisory', label: 'Crop Advisory', icon: <Calendar size={20} /> },
      { path: '/farmer/quality', label: 'Quality Alerts', icon: <AlertTriangle size={20} /> },
      { path: '/farmer/harvest-scheduler', label: 'Harvest Scheduler', icon: <Sprout size={20} /> },
      ...common,
    ],
    agent: [
      { path: '/agent/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/agent/farmers', label: 'My Farmers', icon: <Users size={20} /> },
      { path: '/agent/products', label: 'List Products', icon: <Package size={20} /> },
      { path: '/agent/orders', label: 'Farmer Orders', icon: <ClipboardList size={20} /> },
      { path: '/agent/assign-logistics', label: 'Assign Logistics', icon: <Truck size={20} /> },
      ...common,
    ],
    buyer: [
      { path: '/buyer/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/buyer/marketplace', label: 'Marketplace', icon: <Store size={20} /> },
      { path: '/buyer/cart', label: 'Cart', icon: <ShoppingCart size={20} /> },
      { path: '/buyer/orders', label: 'My Orders', icon: <ClipboardList size={20} /> },
      { path: '/buyer/tracking', label: 'Track Orders', icon: <Navigation size={20} /> },
      { path: '/buyer/wishlist', label: 'Wishlist', icon: <Heart size={20} /> },
      { path: '/buyer/group-buy', label: 'Group Buying', icon: <ShoppingBag size={20} /> },
      { path: '/buyer/reviews', label: 'Review Orders', icon: <Star size={20} /> },
      { path: '/buyer/addresses', label: 'Addresses', icon: <MapPinned size={20} /> },
      { path: '/buyer/nearby', label: 'Nearby Farms', icon: <MapPin size={20} /> },
      { path: '/buyer/price-alerts', label: 'Price Alerts', icon: <BellRing size={20} /> },
      { path: '/buyer/compare', label: 'Compare Products', icon: <GitCompare size={20} /> },
      { path: '/buyer/assign-logistics', label: 'Assign Logistics', icon: <Truck size={20} /> },
      ...common,
    ],
    logistics: [
      { path: '/logistics/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/logistics/deliveries', label: 'Deliveries', icon: <Truck size={20} /> },
      { path: '/logistics/earnings', label: 'Earnings', icon: <DollarSign size={20} /> },
      { path: '/logistics/vehicle', label: 'Vehicle & Status', icon: <Car size={20} /> },
      ...common,
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
      { path: '/admin/transactions', label: 'Transactions', icon: <DollarSign size={20} /> },
      { path: '/community', label: 'Community', icon: <Newspaper size={20} /> },
      { path: '/admin/profile', label: 'Profile', icon: <User size={20} /> },
    ],
  }

  return navs[role] || navs.buyer
}
