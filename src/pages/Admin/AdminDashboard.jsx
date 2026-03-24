import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { getDashboardNav } from '../../data/navConfig'
import {
  Users, Package, DollarSign, TrendingUp, ShoppingCart, Truck,
  AlertTriangle, CheckCircle, ArrowRight, BarChart3, Shield, Activity
} from 'lucide-react'
import { fetchAdminDashboard, fetchAdminActivity } from '../../services/dataService'

export default function AdminDashboard() {
  const navItems = getDashboardNav('admin')
  const [dashboardData, setDashboardData] = useState({})
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchAdminDashboard().then(data => setDashboardData(data))
    fetchAdminActivity().then(data => setRecentActivity(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const typeIcons = { user: <Users size={16} />, order: <Package size={16} />, payment: <DollarSign size={16} />, alert: <AlertTriangle size={16} /> }
  const typeColors = { user: '#2563eb', order: '#16a34a', payment: '#d97706', alert: '#dc2626' }

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={<Users size={22} />} label="Total Users" value="12,847" trend="+342 this week" color="blue" />
        <StatCard icon={<Package size={22} />} label="Active Listings" value="3,291" trend="+89 today" color="green" />
        <StatCard icon={<DollarSign size={22} />} label="Total GMV" value={formatPrice(45600000)} trend="+18% this month" color="orange" />
        <StatCard icon={<Truck size={22} />} label="Deliveries Today" value="156" trend="23 in transit" color="purple" />
      </div>

      {/* User Breakdown + Revenue */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> User Breakdown</h3>
          <div className="admin-user-breakdown">
            {[
              { role: 'Farmers', count: 2547, color: '#16a34a', percent: 35 },
              { role: 'Buyers', count: 8234, color: '#d97706', percent: 45 },
              { role: 'Agents', count: 892, color: '#2563eb', percent: 10 },
              { role: 'Logistics', count: 1174, color: '#db2777', percent: 10 },
            ].map(r => (
              <div key={r.role} className="breakdown-row">
                <div className="breakdown-label">
                  <div className="breakdown-dot" style={{ background: r.color }} />
                  <span>{r.role}</span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${r.percent}%`, background: r.color }} />
                </div>
                <span className="breakdown-count">{r.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} /> Revenue (Last 6 Months)</h3>
          <div className="admin-revenue-chart">
            {[
              { month: 'Oct', value: 5200000, height: 40 },
              { month: 'Nov', value: 6800000, height: 52 },
              { month: 'Dec', value: 8100000, height: 62 },
              { month: 'Jan', value: 7400000, height: 57 },
              { month: 'Feb', value: 9200000, height: 71 },
              { month: 'Mar', value: 12900000, height: 100 },
            ].map(m => (
              <div key={m.month} className="revenue-bar-col">
                <div className="revenue-bar" style={{ height: `${m.height}%` }} />
                <span className="revenue-month">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/admin/users" className="admin-quick-link"><Users size={18} /> Manage Users <ArrowRight size={16} /></Link>
            <Link to="/admin/transactions" className="admin-quick-link"><DollarSign size={18} /> View Transactions <ArrowRight size={16} /></Link>
            <Link to="/admin/reports" className="admin-quick-link"><AlertTriangle size={18} /> Review Reports <ArrowRight size={16} /></Link>
            <Link to="/admin/analytics" className="admin-quick-link"><BarChart3 size={18} /> Full Analytics <ArrowRight size={16} /></Link>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} /> Recent Activity</h3>
          <div className="admin-activity-list">
            {recentActivity.map(a => (
              <div key={a.id} className="admin-activity-item">
                <div className="admin-activity-icon" style={{ background: `${typeColors[a.type]}15`, color: typeColors[a.type] }}>
                  {typeIcons[a.type]}
                </div>
                <div className="admin-activity-info">
                  <span className="admin-activity-action">{a.action}</span>
                  <span className="admin-activity-user">{a.user}</span>
                </div>
                <span className="admin-activity-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
