import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  MapPin, Package, Truck, CheckCircle, Clock,
  Phone, Navigation, AlertTriangle, Shield
} from 'lucide-react'
import { fetchOrders } from '../../services/dataService'
import './Tracking.css'

export default function TrackingPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const navItems = getDashboardNav(user?.role)

  useEffect(() => {
    fetchOrders().then(data => {
      setOrders(data)
      setSelectedOrder(data.find(o => o.status === 'in_transit') || data[0] || null)
    })
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const steps = [
    { label: 'Order Placed', icon: <Package size={16} />, time: '9:00 AM' },
    { label: 'Payment Confirmed', icon: <CheckCircle size={16} />, time: '9:05 AM' },
    { label: 'Pickup by Logistics', icon: <Truck size={16} />, time: '10:30 AM' },
    { label: 'In Transit', icon: <Navigation size={16} />, time: '11:00 AM' },
    { label: 'Delivered', icon: <MapPin size={16} />, time: 'Pending' },
  ]

  const getActiveStep = (status) => {
    const map = { pending: 0, confirmed: 1, processing: 2, in_transit: 3, delivered: 4 }
    return map[status] ?? 0
  }

  if (!selectedOrder) {
    return (
      <DashboardLayout navItems={navItems} title="Track Orders">
        <p className="text-muted">Loading orders...</p>
      </DashboardLayout>
    )
  }

  const activeStep = getActiveStep(selectedOrder.status)

  return (
    <DashboardLayout navItems={navItems} title="Track Orders">
      <div className="tracking-layout">
        {/* Order selector */}
        <div className="tracking-orders-list">
          <h3>My Orders</h3>
          {orders.map(order => (
            <div
              key={order.id}
              className={`tracking-order-item ${selectedOrder.id === order.id ? 'active' : ''}`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="tracking-order-id">{order.id}</div>
              <div className="tracking-order-meta">
                <span>{order.items.length} item(s) &middot; {formatPrice(order.total)}</span>
                <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'in_transit' ? 'badge-info' : 'badge-warning'}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tracking detail */}
        <div className="tracking-detail">
          <div className="tracking-map-placeholder">
            <div className="map-visual">
              <div className="map-grid">
                {/* Simulated map with dots and route */}
                <div className="map-route-line" style={{ width: `${selectedOrder.trackingProgress}%` }} />
                <div className="map-origin">
                  <div className="map-dot origin" />
                  <span>Pickup</span>
                </div>
                <div className="map-current" style={{ left: `${Math.min(selectedOrder.trackingProgress, 95)}%` }}>
                  <div className="map-truck-icon">
                    <Truck size={18} />
                  </div>
                </div>
                <div className="map-destination">
                  <div className="map-dot destination" />
                  <span>Delivery</span>
                </div>
              </div>
              <div className="map-location-label">
                <Navigation size={14} />
                <span>Current Location: <strong>{selectedOrder.currentLocation}</strong></span>
              </div>
            </div>
          </div>

          <div className="tracking-info-card card">
            <h3>Order {selectedOrder.id}</h3>
            <div className="tracking-progress-bar">
              <div className="tracking-fill" style={{ width: `${selectedOrder.trackingProgress}%` }} />
            </div>
            <p className="tracking-percent">{selectedOrder.trackingProgress}% Complete</p>

            <div className="tracking-timeline">
              {steps.map((step, i) => (
                <div key={i} className={`timeline-step ${i <= activeStep ? 'completed' : ''} ${i === activeStep ? 'current' : ''}`}>
                  <div className="timeline-dot">{step.icon}</div>
                  <div className="timeline-content">
                    <span className="timeline-label">{step.label}</span>
                    <span className="timeline-time">{i <= activeStep ? step.time : '--'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="tracking-details-grid">
              <div>
                <span className="tracking-detail-label">Delivery Address</span>
                <span className="tracking-detail-value">{selectedOrder.deliveryAddress}</span>
              </div>
              <div>
                <span className="tracking-detail-label">Payment Status</span>
                <span className={`badge ${selectedOrder.paymentStatus === 'released' ? 'badge-success' : 'badge-info'}`}>
                  {selectedOrder.paymentStatus === 'escrow' ? 'Held in Escrow' : selectedOrder.paymentStatus}
                </span>
              </div>
              <div>
                <span className="tracking-detail-label">Logistics Partner</span>
                <span className="tracking-detail-value">{selectedOrder.logistics || 'Not assigned yet'}</span>
              </div>
              <div>
                <span className="tracking-detail-label">Total Amount</span>
                <span className="tracking-detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {selectedOrder.status === 'in_transit' && (
              <div className="tracking-sos">
                <AlertTriangle size={16} />
                <span>Feel unsafe? Use the SOS button to alert authorities and your emergency contact.</span>
                <button className="btn btn-sm" style={{ background: '#dc2626', color: 'white' }}>
                  <Shield size={14} /> SOS
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
