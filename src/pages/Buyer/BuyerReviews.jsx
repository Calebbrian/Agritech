import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Star, Send, Package } from 'lucide-react'
import { fetchOrders } from '../../services/dataService'
import './Buyer.css'

export default function BuyerReviews() {
  const navItems = getDashboardNav('buyer')
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders().then(data => setOrders(data))
  }, [])

  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const [submitted, setSubmitted] = useState({})

  const handleSubmit = (orderId) => {
    setSubmitted(prev => ({ ...prev, [orderId]: true }))
  }

  return (
    <DashboardLayout navItems={navItems} title="Review Orders">
      <p className="text-muted" style={{ marginBottom: 20 }}>Rate products from your delivered orders to help other buyers and support good farmers.</p>

      {deliveredOrders.length === 0 ? (
        <div className="empty-state">
          <Star size={48} />
          <h3>No delivered orders to review</h3>
          <p>Once your orders are delivered, you can rate them here.</p>
        </div>
      ) : (
        <div className="review-orders-list">
          {deliveredOrders.map(order => (
            <div key={order.id} className="card review-order-card">
              <div className="review-order-header">
                <div>
                  <h4>{order.id}</h4>
                  <span className="text-muted">{order.date}</span>
                </div>
                {submitted[order.id] && <span className="badge badge-success">Reviewed</span>}
              </div>

              {order.items.map((item, i) => (
                <div key={i} className="review-item">
                  <Package size={16} />
                  <span className="review-item-name">{item.name} x{item.qty}</span>
                </div>
              ))}

              {!submitted[order.id] ? (
                <div className="review-form">
                  <div className="review-rating-select">
                    <span>Rate this order:</span>
                    <div className="star-selector">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => setRatings(prev => ({ ...prev, [order.id]: s }))}>
                          <Star size={24} fill={s <= (ratings[order.id] || 0) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="form-input"
                    rows="2"
                    placeholder="Write your review (optional)..."
                    value={comments[order.id] || ''}
                    onChange={e => setComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                  />
                  <button className="btn btn-primary btn-sm" disabled={!ratings[order.id]} onClick={() => handleSubmit(order.id)}>
                    <Send size={14} /> Submit Review
                  </button>
                </div>
              ) : (
                <p className="review-submitted-msg">Thank you for your review!</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
