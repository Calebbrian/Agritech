import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { DollarSign, TrendingUp, Truck, Calendar, Download } from 'lucide-react'
import { fetchLogisticsEarnings } from '../../services/dataService'
import './Logistics.css'

export default function LogisticsEarnings() {
  const navItems = getDashboardNav('logistics')
  const [earnings, setEarnings] = useState([])

  useEffect(() => {
    fetchLogisticsEarnings().then(data => setEarnings(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const totalEarned = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0)
  const todayEarnings = earnings.filter(e => e.date === '2026-03-18').reduce((s, e) => s + e.amount, 0)
  const weekEarnings = earnings.reduce((s, e) => s + e.amount, 0)
  const totalDeliveries = earnings.length

  return (
    <DashboardLayout navItems={navItems} title="Earnings">
      <div className="logistics-stats-grid">
        <div className="logistics-stat-card">
          <DollarSign size={22} />
          <div>
            <span className="logistics-stat-value">{formatPrice(totalEarned)}</span>
            <span className="logistics-stat-label">Total Earned</span>
          </div>
        </div>
        <div className="logistics-stat-card">
          <Calendar size={22} />
          <div>
            <span className="logistics-stat-value">{formatPrice(todayEarnings)}</span>
            <span className="logistics-stat-label">Today</span>
          </div>
        </div>
        <div className="logistics-stat-card">
          <TrendingUp size={22} />
          <div>
            <span className="logistics-stat-value">{formatPrice(weekEarnings)}</span>
            <span className="logistics-stat-label">This Week</span>
          </div>
        </div>
        <div className="logistics-stat-card">
          <Truck size={22} />
          <div>
            <span className="logistics-stat-value">{totalDeliveries}</span>
            <span className="logistics-stat-label">Deliveries</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
          <h3>Earnings History</h3>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Pickup</th>
                <th>Delivery</th>
                <th>Fee</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.orderId}</td>
                  <td>{e.pickup}</td>
                  <td>{e.delivery}</td>
                  <td className="font-medium" style={{ color: 'var(--primary)' }}>{formatPrice(e.amount)}</td>
                  <td>{e.date}</td>
                  <td>
                    <span className={`badge ${e.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
