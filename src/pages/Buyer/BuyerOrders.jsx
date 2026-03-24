import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Package, MapPin } from 'lucide-react'
import { fetchOrders } from '../../services/dataService'
import './Buyer.css'

export default function BuyerOrders() {
  const navItems = getDashboardNav('buyer')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

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

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'processing', 'in_transit', 'delivered']
    return steps.indexOf(status)
  }

  return (
    <DashboardLayout navItems={navItems} title="My Orders">
      <div className="buyer-orders-list">
        {orders.map(order => (
          <div key={order.id} className="card buyer-order-card">
            <div className="buyer-order-header">
              <div>
                <h3>{order.id}</h3>
                <span className="text-muted">{order.date}</span>
              </div>
              <span className={`badge ${getStatusBadge(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="buyer-order-items">
              {order.items.map((item, i) => (
                <div key={i} className="buyer-order-item">
                  <Package size={16} />
                  <span>{item.name} x{item.qty}</span>
                  <span className="buyer-order-item-price">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            <div className="buyer-order-progress">
              {['Pending', 'Confirmed', 'Processing', 'In Transit', 'Delivered'].map((step, i) => (
                <div key={step} className={`progress-step ${i <= getStatusStep(order.status) ? 'active' : ''}`}>
                  <div className="progress-dot" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="buyer-order-footer">
              <div className="buyer-order-address">
                <MapPin size={14} />
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="buyer-order-total">
                <strong>Total: {formatPrice(order.total)}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
