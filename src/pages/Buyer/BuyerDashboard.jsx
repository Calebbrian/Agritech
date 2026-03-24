import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { getDashboardNav } from '../../data/navConfig'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Package, Truck, DollarSign,
  MapPin, Clock, Star, ArrowRight, TrendingUp
} from 'lucide-react'
import { fetchOrders, fetchProducts } from '../../services/dataService'
import './Buyer.css'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const { cartItems } = useCart()
  const navItems = getDashboardNav('buyer')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
    fetchProducts().then(data => setProducts(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
  const activeOrders = orders.filter(o => o.status !== 'delivered').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length
  const recentOrders = orders.slice(0, 4)
  const recommendedProducts = products.slice(0, 4)

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      processing: 'badge-info',
      confirmed: 'badge-info',
      in_transit: 'badge-info',
      delivered: 'badge-success',
    }
    return map[status] || 'badge-info'
  }

  return (
    <DashboardLayout navItems={navItems} title="Buyer Dashboard">
      <div className="buyer-dashboard">
        {/* Welcome */}
        <div className="dashboard-welcome">
          <div>
            <h2>Welcome back, {user?.name || 'Buyer'}</h2>
            <p className="text-muted">Here's an overview of your purchases and activity</p>
          </div>
          <Link to="/buyer/marketplace" className="btn btn-primary">
            <ShoppingBag size={18} /> Browse Marketplace
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard
            icon={<DollarSign size={22} />}
            label="Total Spent"
            value={formatPrice(totalSpent)}
            trend="+12% this month"
            color="green"
          />
          <StatCard
            icon={<Package size={22} />}
            label="Active Orders"
            value={activeOrders}
            trend={`${deliveredOrders} delivered`}
            color="blue"
          />
          <StatCard
            icon={<ShoppingBag size={22} />}
            label="Cart Items"
            value={cartItems.length}
            trend="Ready to checkout"
            color="orange"
          />
          <StatCard
            icon={<Truck size={22} />}
            label="Total Orders"
            value={orders.length}
            trend="All time"
            color="purple"
          />
        </div>

        {/* Recent Orders + Recommended */}
        <div className="buyer-dash-grid">
          {/* Recent Orders */}
          <div className="card">
            <div className="card-header-row">
              <h3>Recent Orders</h3>
              <Link to="/buyer/orders" className="link-sm">View All <ArrowRight size={14} /></Link>
            </div>
            <div className="recent-orders-list">
              {recentOrders.map(order => (
                <div key={order.id} className="recent-order-item">
                  <div className="recent-order-icon">
                    <Package size={18} />
                  </div>
                  <div className="recent-order-info">
                    <h4>{order.id}</h4>
                    <p className="text-muted">{order.items.map(i => i.name).join(', ')}</p>
                  </div>
                  <div className="recent-order-meta">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="recent-order-price">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          <div className="card">
            <div className="card-header-row">
              <h3>Recommended for You</h3>
              <Link to="/buyer/marketplace" className="link-sm">See All <ArrowRight size={14} /></Link>
            </div>
            <div className="recommended-list">
              {recommendedProducts.map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="recommended-item">
                  <img src={product.image} alt={product.name} className="recommended-img" />
                  <div className="recommended-info">
                    <h4>{product.name}</h4>
                    <div className="recommended-meta">
                      <MapPin size={12} /> {product.location}
                    </div>
                  </div>
                  <div className="recommended-price">
                    <strong>{formatPrice(product.price)}</strong>
                    <span className="text-muted">/{product.unit}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Spending Overview */}
        <div className="card spending-overview">
          <div className="card-header-row">
            <h3><TrendingUp size={18} /> Spending Overview</h3>
          </div>
          <div className="spending-bars">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
              const heights = [45, 65, 35, 80, 55, 70]
              return (
                <div key={month} className="spending-bar-col">
                  <div className="spending-bar" style={{ height: `${heights[i]}%` }} />
                  <span>{month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
