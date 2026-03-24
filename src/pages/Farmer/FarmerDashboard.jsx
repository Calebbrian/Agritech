import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  LayoutDashboard, Package, ClipboardList, TrendingUp,
  DollarSign, ShoppingBag, Star, Eye
} from 'lucide-react'
import { fetchOrders, fetchMyProducts } from '../../services/dataService'
import './Farmer.css'

export default function FarmerDashboard() {
  const { user } = useAuth()
  const navItems = getDashboardNav('farmer')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
    fetchMyProducts().then(data => setProducts(data))
  }, [])

  const recentOrders = orders.slice(0, 4)

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

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  return (
    <DashboardLayout navItems={navItems} title="Farmer Dashboard">
      <div className="stats-grid">
        <StatCard
          icon={<Package size={24} />}
          label="Total Products"
          value="12"
          trend="2 new this week"
          trendUp={true}
        />
        <StatCard
          icon={<ShoppingBag size={24} />}
          label="Total Orders"
          value="48"
          trend="12% from last month"
          trendUp={true}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Earnings"
          value={formatPrice(580000)}
          trend="8% increase"
          trendUp={true}
        />
        <StatCard
          icon={<Star size={24} />}
          label="Avg. Rating"
          value="4.7"
          trend="0.2 improvement"
          trendUp={true}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <a href="/farmer/orders" className="view-all">View All</a>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.id}</td>
                    <td>{order.buyer}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-muted">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card dashboard-card">
          <div className="card-header">
            <h3>Top Products</h3>
            <a href="/farmer/products" className="view-all">View All</a>
          </div>
          <div className="top-products-list">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="top-product-item">
                <img src={product.image} alt={product.name} className="top-product-img" />
                <div className="top-product-info">
                  <span className="top-product-name">{product.name}</span>
                  <span className="top-product-price">{formatPrice(product.price)}/{product.unit}</span>
                </div>
                <div className="top-product-stats">
                  <div className="top-product-views">
                    <Eye size={14} />
                    <span>{Math.floor(Math.random() * 500 + 100)}</span>
                  </div>
                  <div className="top-product-rating">
                    <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
                    <span>{product.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
