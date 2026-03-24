import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Users, Clock, MapPin, TrendingDown, Plus, X, ShoppingCart,
  CheckCircle, CreditCard, Truck, Shield, Package, Star
} from 'lucide-react'
import { fetchProducts } from '../../services/dataService'

export default function BuyerGroupBuy() {
  const [groupDeals, setGroupDeals] = useState([])

  useEffect(() => {
    fetchProducts().then(data => {
      setGroupDeals(data.filter(p => p.isGroupDeal).map(p => ({
        id: p.id, product: p.name, farmer: p.farmer, farmerRating: p.rating,
        image: typeof p.image === 'string' ? p.image : (Array.isArray(p.image) ? p.image[0] : ''),
        originalPrice: p.price, groupPrice: p.groupPrice || p.price,
        unit: p.unit, minBuyers: p.groupMinBuyers || 5, currentBuyers: p.groupCurrentBuyers || 0,
        deadline: p.groupDeadline || '', location: p.location, description: p.description,
      })))
    })
  }, [])
  const navItems = getDashboardNav('buyer')
  const [joinedDeals, setJoinedDeals] = useState({})
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState(1) // 1=review, 2=payment, 3=confirmed
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const discount = (orig, group) => Math.round((1 - group / orig) * 100)

  const handleJoin = (deal) => {
    setSelectedDeal(deal)
    setCheckoutStep(1)
    setQuantity(1)
  }

  const confirmPayment = () => {
    setCheckoutStep(3)
    setJoinedDeals(prev => ({ ...prev, [selectedDeal.id]: { quantity, total: selectedDeal.groupPrice * quantity } }))
  }

  const closeModal = () => {
    setSelectedDeal(null)
    setCheckoutStep(1)
    setQuantity(1)
  }

  return (
    <DashboardLayout navItems={navItems} title="Group Buying">
      <div className="group-buy-intro">
        <Users size={24} />
        <div>
          <strong>Buy Together, Save More</strong>
          <p>Join a group order to get bulk discounts. When enough buyers join, the deal activates — farmer prepares all orders and logistics delivers to each buyer. If the minimum isn't reached by the deadline, you get a <strong>full refund</strong>.</p>
        </div>
      </div>

      {/* How it works steps */}
      <div className="group-how-it-works">
        <div className="group-step">
          <div className="group-step-num">1</div>
          <div><strong>Join & Pay</strong><span>Pay the group price upfront. Money goes to escrow.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">2</div>
          <div><strong>Wait for Buyers</strong><span>More buyers join. Track progress in real-time.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">3</div>
          <div><strong>Deal Activates</strong><span>Minimum reached! Farmer prepares your order.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">4</div>
          <div><strong>Delivery</strong><span>Logistics delivers to your address.</span></div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="group-buy-grid">
        {groupDeals.map(deal => {
          const progress = (deal.currentBuyers / deal.minBuyers) * 100
          const isFull = deal.currentBuyers >= deal.minBuyers
          const myOrder = joinedDeals[deal.id]
          return (
            <div key={deal.id} className="card group-deal-card">
              <div className="group-deal-img">
                <img src={deal.image} alt={deal.product} />
                <span className="group-discount-badge"><TrendingDown size={12} /> {discount(deal.originalPrice, deal.groupPrice)}% OFF</span>
                {isFull && <span className="group-active-badge"><CheckCircle size={12} /> DEAL ACTIVE</span>}
              </div>
              <div className="group-deal-body">
                <h4>{deal.product}</h4>
                <p className="text-muted" style={{ marginBottom: 4 }}><MapPin size={12} /> {deal.farmer} — {deal.location}</p>
                <p className="text-muted" style={{ fontSize: '0.688rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={11} fill="#F59E0B" stroke="#F59E0B" /> {deal.farmerRating} rating
                </p>
                <div className="group-prices">
                  <span className="group-price-old">{formatPrice(deal.originalPrice)}</span>
                  <span className="group-price-new">{formatPrice(deal.groupPrice)}</span>
                  <span className="group-price-unit">/ {deal.unit}</span>
                </div>
                <p className="group-savings">You save {formatPrice(deal.originalPrice - deal.groupPrice)} per {deal.unit}</p>
                <div className="group-progress">
                  <div className="group-progress-bar">
                    <div className="group-progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: isFull ? '#16a34a' : undefined }} />
                  </div>
                  <span className="group-progress-text">
                    {deal.currentBuyers}/{deal.minBuyers} buyers {isFull ? '— Deal Active!' : `needed (${deal.minBuyers - deal.currentBuyers} more)`}
                  </span>
                </div>
                <div className="group-deadline"><Clock size={12} /> Ends: {deal.deadline}</div>

                {myOrder ? (
                  <div className="group-joined-info">
                    <CheckCircle size={14} />
                    <div>
                      <strong>You joined — {myOrder.quantity} {deal.unit}(s)</strong>
                      <span>{formatPrice(myOrder.total)} paid (in escrow)</span>
                      <span>{isFull ? 'Deal active — preparing your order' : 'Waiting for more buyers'}</span>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => handleJoin(deal)}>
                    <Plus size={14} /> Join Group Buy — {formatPrice(deal.groupPrice)}/{deal.unit}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== JOIN + CHECKOUT MODAL ===== */}
      {selectedDeal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{checkoutStep === 3 ? 'Order Confirmed!' : `Join Group Buy — ${selectedDeal.product}`}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="modal-body">
              {/* Step 1: Review & Quantity */}
              {checkoutStep === 1 && (
                <>
                  <div className="group-checkout-product">
                    <img src={selectedDeal.image} alt={selectedDeal.product} />
                    <div>
                      <h4>{selectedDeal.product}</h4>
                      <p className="text-muted">{selectedDeal.farmer} — {selectedDeal.location}</p>
                      <p style={{ fontSize: '0.813rem', color: 'var(--neutral-600)', marginTop: 4 }}>{selectedDeal.description}</p>
                    </div>
                  </div>

                  <div className="group-checkout-pricing">
                    <div className="group-checkout-row">
                      <span>Normal price:</span>
                      <span className="group-price-old">{formatPrice(selectedDeal.originalPrice)}/{selectedDeal.unit}</span>
                    </div>
                    <div className="group-checkout-row highlight">
                      <span>Group price:</span>
                      <span className="group-price-new">{formatPrice(selectedDeal.groupPrice)}/{selectedDeal.unit}</span>
                    </div>
                    <div className="group-checkout-row">
                      <span>You save:</span>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatPrice(selectedDeal.originalPrice - selectedDeal.groupPrice)} per {selectedDeal.unit} ({discount(selectedDeal.originalPrice, selectedDeal.groupPrice)}%)</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>How many {selectedDeal.unit}(s) do you want?</label>
                    <div className="quantity-selector" style={{ width: 'fit-content' }}>
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)}>+</button>
                    </div>
                  </div>

                  <div className="group-checkout-total">
                    <span>Total to pay:</span>
                    <strong>{formatPrice(selectedDeal.groupPrice * quantity)}</strong>
                  </div>

                  <div className="group-guarantee">
                    <Shield size={14} />
                    <span>If the minimum {selectedDeal.minBuyers} buyers isn't reached by {selectedDeal.deadline}, you get a <strong>full refund</strong>.</span>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setCheckoutStep(2)}>
                    Proceed to Payment — {formatPrice(selectedDeal.groupPrice * quantity)}
                  </button>
                </>
              )}

              {/* Step 2: Payment */}
              {checkoutStep === 2 && (
                <>
                  <div className="group-checkout-summary">
                    <div className="group-checkout-row"><span>{selectedDeal.product} × {quantity}</span><span>{formatPrice(selectedDeal.groupPrice * quantity)}</span></div>
                    <div className="group-checkout-row"><span>Delivery fee</span><span className="text-muted">Calculated after deal activates</span></div>
                    <div className="group-checkout-row total"><span>Pay now (escrow)</span><strong>{formatPrice(selectedDeal.groupPrice * quantity)}</strong></div>
                  </div>

                  <div className="form-group">
                    <label>Delivery Address</label>
                    <textarea className="form-input" rows="2" required placeholder="Enter your full delivery address" />
                  </div>

                  <div className="form-group">
                    <label>Payment Method</label>
                    <select className="form-select" required>
                      <option value="">Select payment method</option>
                      <option value="card">Debit Card</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="mobile">Mobile Money</option>
                    </select>
                  </div>

                  <div className="group-escrow-note">
                    <CreditCard size={14} />
                    <span>Payment is held in <strong>escrow</strong>. Farmer only gets paid after your order is delivered. If deal doesn't activate, you get a full refund.</span>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-ghost" onClick={() => setCheckoutStep(1)}>Back</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmPayment}>
                      <CreditCard size={16} /> Pay {formatPrice(selectedDeal.groupPrice * quantity)}
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Confirmed */}
              {checkoutStep === 3 && (
                <div className="group-confirmed">
                  <div className="group-confirmed-icon"><CheckCircle size={48} /></div>
                  <h3>You've Joined the Group Buy!</h3>
                  <p>Your payment of <strong>{formatPrice(selectedDeal.groupPrice * quantity)}</strong> is held safely in escrow.</p>

                  <div className="group-confirmed-status">
                    <h4>What happens next:</h4>
                    <div className="group-next-steps">
                      <div className="group-next-step">
                        <Users size={16} />
                        <div>
                          <strong>Waiting for buyers</strong>
                          <span>{selectedDeal.currentBuyers + 1}/{selectedDeal.minBuyers} joined — {selectedDeal.minBuyers - selectedDeal.currentBuyers - 1} more needed</span>
                        </div>
                      </div>
                      <div className="group-next-step">
                        <Package size={16} />
                        <div>
                          <strong>Farmer prepares order</strong>
                          <span>Once minimum is reached, {selectedDeal.farmer} prepares your {quantity} {selectedDeal.unit}(s)</span>
                        </div>
                      </div>
                      <div className="group-next-step">
                        <Truck size={16} />
                        <div>
                          <strong>Delivery to your address</strong>
                          <span>Logistics picks up from farm and delivers to you. Delivery fee added then.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={closeModal}>Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
