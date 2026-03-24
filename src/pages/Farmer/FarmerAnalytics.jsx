import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { fetchMyProducts } from '../../services/dataService'
import { TrendingUp, Eye, ShoppingCart, DollarSign, BarChart3, Package } from 'lucide-react'
import './Farmer.css'

export default function FarmerAnalytics() {
  const navItems = getDashboardNav('farmer')
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchMyProducts().then(data => setProducts(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const productStats = products.slice(0, 8).map(p => ({
    ...p,
    views: Math.floor(Math.random() * 500) + 50,
    clicks: Math.floor(Math.random() * 200) + 20,
    orders: Math.floor(Math.random() * 30) + 1,
    revenue: p.price * (Math.floor(Math.random() * 30) + 1),
    conversionRate: (Math.random() * 15 + 2).toFixed(1),
  }))

  const totalRevenue = productStats.reduce((s, p) => s + p.revenue, 0)
  const totalViews = productStats.reduce((s, p) => s + p.views, 0)
  const totalOrders = productStats.reduce((s, p) => s + p.orders, 0)

  return (
    <DashboardLayout navItems={navItems} title="Product Analytics">
      {/* Overview Stats */}
      <div className="analytics-overview">
        <div className="analytics-stat">
          <Eye size={20} />
          <div>
            <span className="analytics-value">{totalViews.toLocaleString()}</span>
            <span className="analytics-label">Total Views</span>
          </div>
        </div>
        <div className="analytics-stat">
          <ShoppingCart size={20} />
          <div>
            <span className="analytics-value">{totalOrders}</span>
            <span className="analytics-label">Total Orders</span>
          </div>
        </div>
        <div className="analytics-stat">
          <DollarSign size={20} />
          <div>
            <span className="analytics-value">{formatPrice(totalRevenue)}</span>
            <span className="analytics-label">Total Revenue</span>
          </div>
        </div>
        <div className="analytics-stat">
          <TrendingUp size={20} />
          <div>
            <span className="analytics-value">{(totalOrders / totalViews * 100).toFixed(1)}%</span>
            <span className="analytics-label">Avg Conversion</span>
          </div>
        </div>
      </div>

      {/* Top Products Chart */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={18} /> Product Performance
        </h3>
        <div className="analytics-bars">
          {productStats.sort((a, b) => b.revenue - a.revenue).slice(0, 6).map(p => (
            <div key={p.id} className="analytics-bar-row">
              <div className="analytics-bar-label">
                <img src={p.image} alt={p.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
                <span>{p.name}</span>
              </div>
              <div className="analytics-bar-track">
                <div className="analytics-bar-fill" style={{ width: `${(p.revenue / productStats[0].revenue * 100)}%` }} />
              </div>
              <span className="analytics-bar-value">{formatPrice(p.revenue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Clicks</th>
                <th>Orders</th>
                <th>Conversion</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {productStats.sort((a, b) => b.revenue - a.revenue).map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={p.image} alt={p.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.views}</td>
                  <td>{p.clicks}</td>
                  <td>{p.orders}</td>
                  <td><span className="badge badge-success">{p.conversionRate}%</span></td>
                  <td className="font-medium">{formatPrice(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
