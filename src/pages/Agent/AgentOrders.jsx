import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Eye, Truck, CheckCircle, Phone, MessageCircle, CreditCard
} from 'lucide-react'
import { fetchOrders } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Agent.css'

export default function AgentOrders() {
  const { user } = useAuth()
  const navItems = getDashboardNav('agent')
  const [filter, setFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', processing: 'badge-info', confirmed: 'badge-info', in_transit: 'badge-info', delivered: 'badge-success' }
    return map[status] || 'badge-info'
  }

  return (
    <DashboardLayout navItems={navItems} title="Farmer Orders">
      <div className="agent-register-note" style={{ marginBottom: 24 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Your Role in Orders</strong>
        When a buyer orders a product you listed, you need to: (1) Call or visit the farmer to confirm the product is ready,
        (2) Arrange logistics for pickup from the farm, (3) The buyer's payment stays in escrow until delivery is confirmed,
        then the farmer gets paid directly.
      </div>

      <div className="page-toolbar">
        <div className="filter-tabs">
          {['all', 'pending', 'confirmed', 'in_transit', 'delivered'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Orders' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="agent-orders-list">
        {filtered.map(order => (
          <div key={order.id} className="card agent-order-card">
            <div className="agent-order-header">
              <div>
                <h4>{order.id}</h4>
                <span className="text-muted">{order.date}</span>
              </div>
              <span className={`badge ${getStatusBadge(order.status)}`}>{order.status.replace('_', ' ')}</span>
            </div>

            <div className="agent-order-body">
              <div className="agent-order-info">
                <div className="agent-order-label">Buyer</div>
                <div className="agent-order-value">{order.buyer}</div>
              </div>
              <div className="agent-order-info">
                <div className="agent-order-label">Items</div>
                <div className="agent-order-value">
                  {order.items.map((item, i) => (
                    <span key={i}>{item.name} x{item.qty}{i < order.items.length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
              </div>
              <div className="agent-order-info">
                <div className="agent-order-label">Delivery To</div>
                <div className="agent-order-value">{order.deliveryAddress}</div>
              </div>
              <div className="agent-order-info">
                <div className="agent-order-label">Total</div>
                <div className="agent-order-value" style={{ fontWeight: 700 }}>{formatPrice(order.total)}</div>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="agent-order-payment">
              <CreditCard size={14} />
              <span>
                Farmer receives: <strong style={{ color: 'var(--primary)' }}>{formatPrice(order.total * 0.90)}</strong>
                {' · '}Your commission: <strong style={{ color: '#2563eb' }}>{formatPrice(order.total * 0.10)}</strong>
              </span>
            </div>

            {/* Action buttons based on status */}
            <div className="agent-order-actions">
              {order.status === 'pending' && (
                <>
                  <button className="btn btn-primary btn-sm"><Phone size={14} /> Call Farmer to Confirm</button>
                  <button className="btn btn-secondary btn-sm"><CheckCircle size={14} /> Mark Confirmed</button>
                </>
              )}
              {order.status === 'confirmed' && (
                <button className="btn btn-primary btn-sm"><Truck size={14} /> Assign Logistics Pickup</button>
              )}
              {(order.status === 'processing' || order.status === 'in_transit') && (
                <button className="btn btn-ghost btn-sm"><Eye size={14} /> Track Delivery</button>
              )}
              {order.status === 'delivered' && (
                <div className="order-complete-badge">
                  <CheckCircle size={14} /> Delivered — Farmer has been paid
                </div>
              )}
              <button className="btn btn-ghost btn-sm"><MessageCircle size={14} /> Message Buyer</button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
