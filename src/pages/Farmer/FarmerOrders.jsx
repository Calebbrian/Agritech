import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import { Eye } from 'lucide-react'
import { fetchOrders, updateOrderStatus } from '../../services/dataService'
import { useState, useEffect } from 'react'
import './Farmer.css'

export default function FarmerOrders() {
  const { user } = useAuth()
  const navItems = getDashboardNav('farmer')
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
    <DashboardLayout navItems={navItems} title="Orders">
      <div className="page-toolbar">
        <div className="filter-tabs">
          {['all', 'pending', 'confirmed', 'in_transit', 'delivered'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Orders' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td className="font-medium">{order.orderId || order.id}</td>
                  <td>{order.buyer}</td>
                  <td>{typeof order.items === 'number' ? order.items : order.items?.length || 1} item(s)</td>
                  <td className="font-medium">{formatPrice(order.amount || order.total || 0)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-muted">{order.date}</td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(order)}>
                      <Eye size={14} /> View
                    </button>
                    {order.status === 'pending' && (
                      <button className="btn btn-primary btn-sm" onClick={async () => {
                        try {
                          await updateOrderStatus(order.id, { status: 'confirmed' })
                          setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'confirmed' } : o))
                        } catch (err) { alert(err.response?.data?.detail || 'Failed') }
                      }}>
                        Confirm
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order {selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>x</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h4>Buyer Information</h4>
                <p><strong>Name:</strong> {selectedOrder.buyer}</p>
                <p><strong>Delivery:</strong> {selectedOrder.deliveryAddress}</p>
              </div>
              <div className="order-detail-section">
                <h4>Items</h4>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="order-item-row">
                    <span>{item.name} x{item.qty}</span>
                    <span>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="order-item-row order-total-row">
                  <strong>Total</strong>
                  <strong>{formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>
              <div className="order-detail-section">
                <h4>Status</h4>
                <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
