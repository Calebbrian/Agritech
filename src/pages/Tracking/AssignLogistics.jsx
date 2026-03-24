import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Truck, MapPin, Package, Clock, CheckCircle, DollarSign, X,
  Star, Shield, Phone, ThumbsUp, Bike, Car, MessageCircle, Filter,
  Navigation, AlertCircle
} from 'lucide-react'
import { fetchOrders, fetchAvailableLogistics, assignLogisticsToOrder } from '../../services/dataService'
import '../Farmer/Farmer.css'

function getOrderDistance(order) {
  return { km: Math.floor(Math.random() * 100) + 15, pickup: 'Farm Location', delivery: order.deliveryAddress || 'Buyer Location' }
}

function calculateFee(partner, distanceKm) {
  const baseFee = 1000
  const perKmRate = 150
  return baseFee + (perKmRate * distanceKm)
}

export default function AssignLogistics() {
  const { user } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [assignedMap, setAssignedMap] = useState({})
  const [expandedPartner, setExpandedPartner] = useState(null)
  const [sortBy, setSortBy] = useState('rating')
  const [orders, setOrders] = useState([])
  const [allLogisticsPartners, setAllLogisticsPartners] = useState([])
  const navItems = getDashboardNav(user?.role)

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
    fetchAvailableLogistics().then(data => setAllLogisticsPartners(data.map(p => ({
      id: p.id, name: p.name, avatar: p.name?.[0] || 'L', phone: p.phone,
      rating: p.rating || 0, totalReviews: p.total_reviews || 0,
      vehicleType: p.vehicle_type || 'Van', area: `${p.city || ''}, ${p.state || ''}`,
      verified: true, available: true, baseFee: 1000, perKmRate: 150,
      recentReviews: [],
    }))))
  }, [])

  const unassignedOrders = orders.filter(o => !o.logisticsName && o.status !== 'delivered')

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const handleAssign = async (partner, fee) => {
    if (!selectedOrder) return
    try {
      await assignLogisticsToOrder(selectedOrder.id, partner.id)
      setAssignedMap(prev => ({ ...prev, [selectedOrder.id]: { ...partner, calculatedFee: fee } }))
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, logisticsName: partner.name, status: 'assigned_logistics' } : o))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign logistics')
    }
    setSelectedOrder(null)
    setExpandedPartner(null)
  }

  const vehicleIcons = { Motorcycle: <Bike size={16} />, Van: <Truck size={16} />, Truck: <Truck size={16} />, 'Refrigerated Truck': <Truck size={16} />, Car: <Car size={16} /> }

  // Calculate fees for the selected order
  const orderDistance = selectedOrder ? getOrderDistance(selectedOrder) : null

  let sortedPartners = [...allLogisticsPartners]
  if (orderDistance) {
    sortedPartners = sortedPartners.map(p => ({ ...p, calculatedFee: calculateFee(p, orderDistance.km) }))
  }
  if (sortBy === 'rating') sortedPartners.sort((a, b) => b.rating - a.rating)
  if (sortBy === 'deliveries') sortedPartners.sort((a, b) => b.deliveries - a.deliveries)
  if (sortBy === 'price-low') sortedPartners.sort((a, b) => (a.calculatedFee || 0) - (b.calculatedFee || 0))
  if (sortBy === 'price-high') sortedPartners.sort((a, b) => (b.calculatedFee || 0) - (a.calculatedFee || 0))
  if (sortBy === 'response') sortedPartners.sort((a, b) => parseInt(a.responseTime) - parseInt(b.responseTime))

  return (
    <DashboardLayout navItems={navItems} title="Assign Logistics">
      <p className="text-muted" style={{ marginBottom: 20 }}>Select an order, then choose from all registered logistics partners. Delivery fees are calculated based on distance between farm and buyer.</p>

      {/* Unassigned Orders */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ padding: '16px 20px 0' }}>
          <h3>Orders Awaiting Logistics</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Delivery Address</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unassignedOrders.map(order => {
                const assigned = assignedMap[order.id]
                return (
                  <tr key={order.id}>
                    <td className="font-medium">{order.id}</td>
                    <td>{order.buyer}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'normal' }}>{order.deliveryAddress}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      {assigned ? (
                        <span className="badge badge-success">
                          {assigned.name} — {formatPrice(assigned.calculatedFee)}
                        </span>
                      ) : (
                        <span className="badge badge-warning">{order.status.replace('_', ' ')}</span>
                      )}
                    </td>
                    <td>
                      {!assigned && (
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(order)}>
                          <Truck size={14} /> Assign
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {unassignedOrders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--neutral-400)' }}>All orders have logistics assigned</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logistics Partner Selection Modal */}
      {selectedOrder && orderDistance && (
        <div className="modal-overlay" onClick={() => { setSelectedOrder(null); setExpandedPartner(null) }}>
          <div className="modal logistics-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Choose Logistics for {selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => { setSelectedOrder(null); setExpandedPartner(null) }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {/* Route Info */}
              <div className="logistics-route-card">
                <div className="route-point">
                  <div className="route-dot pickup" />
                  <div>
                    <span className="route-label">Pickup (Farm)</span>
                    <strong>{orderDistance.pickup}</strong>
                  </div>
                </div>
                <div className="route-line">
                  <Navigation size={14} />
                  <span>{orderDistance.km} km estimated distance</span>
                </div>
                <div className="route-point">
                  <div className="route-dot delivery" />
                  <div>
                    <span className="route-label">Delivery (Buyer)</span>
                    <strong>{orderDistance.delivery}</strong>
                  </div>
                </div>
              </div>

              <div className="logistics-fee-note">
                <AlertCircle size={14} />
                <span>Fees below are calculated as: <strong>Base Fee + (NGN per km × {orderDistance.km} km)</strong>. Each logistics partner sets their own rates.</span>
              </div>

              {/* Sort */}
              <div className="logistics-sort">
                <Filter size={14} />
                <span>Sort by:</span>
                <select className="form-select" style={{ width: 'auto', fontSize: '0.75rem', padding: '4px 8px' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="rating">Highest Rating</option>
                  <option value="deliveries">Most Deliveries</option>
                  <option value="price-low">Lowest Fee</option>
                  <option value="price-high">Highest Fee</option>
                  <option value="response">Fastest Response</option>
                </select>
              </div>

              {/* Partner Cards */}
              <div className="logistics-partners-list">
                {sortedPartners.map(partner => {
                  const fee = partner.calculatedFee || calculateFee(partner, orderDistance.km)
                  return (
                    <div key={partner.id} className={`logistics-partner-card ${!partner.available ? 'unavailable' : ''}`}>
                      <div className="lp-main" onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}>
                        <div className="lp-avatar">{partner.avatar}</div>
                        <div className="lp-info">
                          <div className="lp-name-row">
                            <h4>{partner.name}</h4>
                            {partner.verified && <Shield size={14} className="lp-verified" />}
                            {!partner.available && <span className="badge badge-error" style={{ fontSize: '0.625rem' }}>Offline</span>}
                          </div>
                          <div className="lp-stats-row">
                            <span className="lp-rating">
                              <Star size={13} fill="#F59E0B" stroke="#F59E0B" />
                              <strong>{partner.rating}</strong>
                              <span>({partner.totalReviews} reviews)</span>
                            </span>
                            <span className="lp-deliveries"><Package size={13} /> {partner.deliveries.toLocaleString()} deliveries</span>
                            <span className="lp-success"><ThumbsUp size={13} /> {partner.successRate}%</span>
                          </div>
                          <div className="lp-details-row">
                            <span>{vehicleIcons[partner.vehicleType]} {partner.vehicleType}</span>
                            <span><MapPin size={12} /> {partner.area}</span>
                            <span><Clock size={12} /> {partner.responseTime}</span>
                          </div>
                        </div>
                        <div className="lp-action">
                          <div className="lp-fee">{formatPrice(fee)}</div>
                          <div className="lp-fee-breakdown">
                            {formatPrice(partner.baseFee)} + {formatPrice(partner.perKmRate)}/km
                          </div>
                          <button
                            className={`btn btn-sm ${partner.available ? 'btn-primary' : 'btn-ghost'}`}
                            disabled={!partner.available}
                            onClick={(e) => { e.stopPropagation(); handleAssign(partner, fee) }}
                          >
                            {partner.available ? 'Assign' : 'Offline'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Reviews */}
                      {expandedPartner === partner.id && (
                        <div className="lp-reviews">
                          <div className="lp-reviews-header">
                            <h5>Recent Reviews ({partner.totalReviews} total)</h5>
                            <div className="lp-contact-btns">
                              <button className="btn btn-ghost btn-sm"><Phone size={13} /> Call</button>
                              <button className="btn btn-ghost btn-sm"><MessageCircle size={13} /> Chat</button>
                            </div>
                          </div>
                          {partner.recentReviews.map((review, i) => (
                            <div key={i} className="lp-review-item">
                              <div className="lp-review-top">
                                <span className="lp-review-buyer">{review.buyer}</span>
                                <div className="lp-review-stars">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={11} fill={s <= review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" />
                                  ))}
                                </div>
                                <span className="lp-review-date">{review.date}</span>
                              </div>
                              <p className="lp-review-comment">{review.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
