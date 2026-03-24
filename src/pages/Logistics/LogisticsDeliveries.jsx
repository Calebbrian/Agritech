import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Truck, Clock, Phone, MapPin, CheckCircle, X, Camera,
  Navigation, XCircle, Package, AlertTriangle
} from 'lucide-react'
import FileUpload from '../../components/FileUpload'
import { fetchDeliveries, acceptDelivery as acceptAPI, rejectDelivery as rejectAPI, updateOrderStatus } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Logistics.css'

export default function LogisticsDeliveries() {
  const { user } = useAuth()
  const navItems = getDashboardNav('logistics')
  const [filter, setFilter] = useState('all')
  const [deliveryList, setDeliveryList] = useState([])

  useEffect(() => {
    fetchDeliveries().then(data => setDeliveryList(data))
  }, [])
  const [showPOD, setShowPOD] = useState(null)
  const [podPhoto, setPodPhoto] = useState(false)
  const [podImageUrl, setPodImageUrl] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const filtered = filter === 'all'
    ? deliveryList
    : deliveryList.filter(d => d.status === filter)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', assigned_logistics: 'badge-warning', accepted: 'badge-info', picked_up: 'badge-info', in_transit: 'badge-info', delivered: 'badge-success', rejected: 'badge-error' }
    return map[status] || 'badge-info'
  }

  const acceptDelivery = async (id) => {
    try {
      await acceptAPI(id)
      setDeliveryList(prev => prev.map(d => d.id === id ? { ...d, status: 'picked_up' } : d))
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const rejectDelivery = async (id) => {
    try {
      await rejectAPI(id)
      setDeliveryList(prev => prev.filter(d => d.id !== id))
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
    setShowRejectModal(null)
    setRejectReason('')
  }

  const startDelivery = async (id) => {
    try {
      await updateOrderStatus(id, { status: 'in_transit' })
      setDeliveryList(prev => prev.map(d => d.id === id ? { ...d, status: 'in_transit' } : d))
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
  }

  const completeDelivery = async (id) => {
    try {
      await updateOrderStatus(id, { status: 'delivered' })
      setDeliveryList(prev => prev.map(d => d.id === id ? { ...d, status: 'delivered' } : d))
    } catch (err) { alert(err.response?.data?.detail || 'Failed') }
    setShowPOD(null)
    setPodPhoto(false)
  }

  const pendingCount = deliveryList.filter(d => d.status === 'pending' || d.status === 'assigned_logistics').length

  return (
    <DashboardLayout navItems={navItems} title="Deliveries">
      {/* Pending alert */}
      {pendingCount > 0 && (
        <div className="delivery-alert">
          <AlertTriangle size={18} />
          <span>You have <strong>{pendingCount} new delivery request(s)</strong> waiting for your response. Accept or reject below.</span>
        </div>
      )}

      <div className="page-toolbar">
        <div className="filter-tabs">
          {['all', 'pending', 'accepted', 'in_transit', 'delivered', 'rejected'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.replace('_', ' ')}
              {f === 'pending' && pendingCount > 0 && <span className="filter-badge">{pendingCount}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries */}
      <div className="deliveries-list">
        {filtered.map(d => (
          <div key={d.id} className={`card delivery-card ${d.status === 'pending' ? 'delivery-pending' : ''}`}>
            <div className="delivery-header">
              <div>
                <h4>{d.id}</h4>
                <span className="text-muted">Order: {d.orderId} · {d.date}</span>
              </div>
              <span className={`badge ${getStatusBadge(d.status)}`}>{d.status.replace('_', ' ')}</span>
            </div>

            <div className="delivery-route">
              <div className="delivery-route-point">
                <div className="route-dot pickup" />
                <div>
                  <span className="route-label">Pickup</span>
                  <span className="route-address">{d.pickup}</span>
                </div>
              </div>
              <div className="delivery-route-line" />
              <div className="delivery-route-point">
                <div className="route-dot delivery" />
                <div>
                  <span className="route-label">Deliver to</span>
                  <span className="route-address">{d.dropoff}</span>
                </div>
              </div>
            </div>

            <div className="delivery-info-row">
              <span><Package size={14} /> {d.buyer}</span>
              <span className="delivery-fee"><strong>{formatPrice(d.fee)}</strong> delivery fee</span>
            </div>

            {/* Action Buttons Based on Status */}
            <div className="delivery-actions">
              {d.status === 'pending' && (
                <>
                  <button className="btn btn-primary" onClick={() => acceptDelivery(d.id)}>
                    <CheckCircle size={16} /> Accept Delivery
                  </button>
                  <button className="btn btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}
                    onClick={() => setShowRejectModal(d.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
              {d.status === 'accepted' && (
                <button className="btn btn-primary" onClick={() => startDelivery(d.id)}>
                  <Navigation size={16} /> Start Delivery — Navigate to Pickup
                </button>
              )}
              {d.status === 'in_transit' && (
                <button className="btn btn-primary" onClick={() => setShowPOD(d.id)}>
                  <Camera size={16} /> Complete — Upload Proof of Delivery
                </button>
              )}
              {d.status === 'delivered' && (
                <div className="delivery-complete-badge">
                  <CheckCircle size={16} /> Delivered — {formatPrice(d.fee)} earned
                </div>
              )}
              {d.status === 'rejected' && (
                <div className="delivery-rejected-badge">
                  <XCircle size={16} /> You rejected this delivery
                </div>
              )}
              {(d.status === 'accepted' || d.status === 'in_transit') && (
                <button className="btn btn-ghost btn-sm"><Phone size={14} /> Call Buyer</button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: 60 }}>
            <Truck size={48} />
            <h3>No deliveries found</h3>
            <p>No deliveries match this filter.</p>
          </div>
        )}
      </div>

      {/* Proof of Delivery Modal */}
      {showPOD && (
        <div className="modal-overlay" onClick={() => { setShowPOD(null); setPodPhoto(false) }}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Proof of Delivery</h3>
              <button className="modal-close" onClick={() => { setShowPOD(null); setPodPhoto(false) }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 16 }}>
                Take a photo of the delivered products at the buyer's location. This serves as proof of delivery and triggers payment release to the farmer.
              </p>

              {!podPhoto ? (
                <div className="pod-capture">
                  <FileUpload
                    onUpload={(urls) => { setPodImageUrl(urls[0]); setPodPhoto(true) }}
                    accept="image"
                    label="Take or upload delivery photo"
                  />
                </div>
              ) : (
                <>
                  <div className="pod-preview">
                    {podImageUrl ? (
                      <img src={`http://localhost:8000${podImageUrl}`} alt="POD" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
                    ) : (
                      <div className="pod-photo-placeholder">
                        <CheckCircle size={32} />
                        <span>Photo captured</span>
                      </div>
                    )}
                  </div>
                  <div className="pod-checklist">
                    <label><input type="checkbox" defaultChecked /> Products handed to buyer</label>
                    <label><input type="checkbox" defaultChecked /> Products in good condition</label>
                    <label><input type="checkbox" /> Buyer confirmed receipt</label>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}
                    onClick={() => completeDelivery(showPOD)}>
                    <CheckCircle size={16} /> Confirm Delivery Complete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reject Delivery</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--neutral-600)', marginBottom: 12 }}>
                Why are you rejecting this delivery? This helps us improve matching.
              </p>
              <div className="form-group">
                <select className="form-select" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                  <option value="">Select reason...</option>
                  <option value="too_far">Too far from my location</option>
                  <option value="busy">Already busy with another delivery</option>
                  <option value="vehicle">My vehicle can't handle this order</option>
                  <option value="area">I don't cover this area</option>
                  <option value="other">Other reason</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={!rejectReason}
                onClick={() => rejectDelivery(showRejectModal)}>
                Confirm Reject
              </button>
              <p style={{ fontSize: '0.688rem', color: 'var(--neutral-400)', marginTop: 8, textAlign: 'center' }}>
                Rejecting too many deliveries may affect your visibility on the platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
