import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import { Truck, Package, DollarSign, Clock, CheckCircle, MapPin, Phone } from 'lucide-react'
import { fetchLogisticsDashboard, fetchDeliveries } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Logistics.css'

export default function LogisticsDashboard() {
  const { user } = useAuth()
  const navItems = getDashboardNav('logistics')
  const [dashData, setDashData] = useState(null)
  const [deliveries, setDeliveries] = useState([])

  useEffect(() => {
    fetchLogisticsDashboard().then(data => setDashData(data))
    fetchDeliveries().then(data => setDeliveries(data))
  }, [])
  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      in_transit: 'badge-info',
      delivered: 'badge-success',
    }
    return map[status] || 'badge-info'
  }

  const pendingCount = deliveries.filter(d => d.status === 'pending').length
  const activeCount = deliveries.filter(d => d.status === 'in_transit').length
  const completedCount = deliveries.filter(d => d.status === 'delivered').length
  const totalEarnings = deliveries.reduce((sum, d) => sum + d.fee, 0)

  return (
    <DashboardLayout navItems={navItems} title="Logistics Dashboard">
      <div className="stats-grid">
        <StatCard
          icon={<Package size={24} />}
          label="Pending Pickups"
          value={pendingCount}
          trend="New assignments"
          trendUp={true}
        />
        <StatCard
          icon={<Truck size={24} />}
          label="Active Deliveries"
          value={activeCount}
          trend="In transit now"
          trendUp={true}
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label="Completed"
          value={completedCount}
          trend="This month"
          trendUp={true}
        />
        <StatCard
          icon={<DollarSign size={24} />}
          label="Total Earnings"
          value={formatPrice(totalEarnings)}
          trend="This month"
          trendUp={true}
        />
      </div>

      <div className="deliveries-list">
        <h3 className="section-title">Active & Pending Deliveries</h3>

        {deliveries.filter(d => d.status !== 'delivered').map(delivery => (
          <div key={delivery.id} className="card delivery-card">
            <div className="delivery-card-header">
              <div>
                <h4>{delivery.id}</h4>
                <span className="text-muted">Order: {delivery.orderId}</span>
              </div>
              <span className={`badge ${getStatusBadge(delivery.status)}`}>
                {delivery.status.replace('_', ' ')}
              </span>
            </div>

            <div className="delivery-route">
              <div className="route-point pickup">
                <div className="route-dot" />
                <div>
                  <span className="route-label">Pickup</span>
                  <span className="route-address">{delivery.pickup}</span>
                </div>
              </div>
              <div className="route-line" />
              <div className="route-point dropoff">
                <div className="route-dot" />
                <div>
                  <span className="route-label">Delivery</span>
                  <span className="route-address">{delivery.dropoff}</span>
                </div>
              </div>
            </div>

            <div className="delivery-card-footer">
              <div className="delivery-meta">
                <div><Clock size={14} /> {delivery.estimatedTime}</div>
                <div><Phone size={14} /> {delivery.buyerPhone}</div>
              </div>
              <div className="delivery-fee">
                <span>Fee: </span>
                <strong>{formatPrice(delivery.fee)}</strong>
              </div>
            </div>

            {delivery.status === 'pending' && (
              <div className="delivery-actions">
                <button className="btn btn-primary btn-sm">Accept Delivery</button>
                <button className="btn btn-ghost btn-sm">Decline</button>
              </div>
            )}
            {delivery.status === 'in_transit' && (
              <div className="delivery-actions">
                <button className="btn btn-primary btn-sm">Mark as Delivered</button>
                <button className="btn btn-ghost btn-sm">Call Buyer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
