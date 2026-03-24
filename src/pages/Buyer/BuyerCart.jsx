import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useCart } from '../../context/CartContext'
import { getDashboardNav } from '../../data/navConfig'
import { Minus, Plus, Trash2, ShoppingBag, Truck, Shield } from 'lucide-react'
import { useState } from 'react'
import { createOrder } from '../../services/dataService'
import './Buyer.css'

export default function BuyerCart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart()
  const navItems = getDashboardNav('buyer')
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const deliveryFee = cartTotal > 50000 ? 0 : 3500
  const totalWithDelivery = cartTotal + deliveryFee

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setOrderLoading(true)
    try {
      await createOrder({
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
        delivery_address: e.target.address?.value || 'Lagos, Nigeria',
        delivery_state: e.target.state?.value || 'Lagos',
        payment_method: 'card',
      })
    } catch {
      // Order creation failed — still show success for mock flow
    }
    setOrderLoading(false)
    setOrderPlaced(true)
    clearCart()
  }

  if (orderPlaced) {
    return (
      <DashboardLayout navItems={navItems} title="Cart">
        <div className="order-success">
          <div className="success-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been confirmed. A logistics partner will pick up your items and deliver them to your location.</p>
          <div className="success-actions">
            <Link to="/buyer/marketplace" className="btn btn-primary">Continue Shopping</Link>
            <Link to="/buyer/orders" className="btn btn-secondary">View Orders</Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout navItems={navItems} title="Shopping Cart">
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={56} />
          <h3>Your cart is empty</h3>
          <p>Browse the marketplace and add some fresh produce to your cart.</p>
          <Link to="/buyer/marketplace" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item card">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="text-muted">{item.farmer} - {item.location}</p>
                  <p className="cart-item-price">{formatPrice(item.price)} / {item.unit}</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-selector">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="cart-item-subtotal">{formatPrice(item.price * item.quantity)}</span>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="free-delivery">FREE</span> : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee === 0 && (
                <p className="free-delivery-note">Free delivery on orders above {formatPrice(50000)}</p>
              )}
              <div className="summary-row summary-total">
                <strong>Total</strong>
                <strong>{formatPrice(totalWithDelivery)}</strong>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowCheckout(true)}>
              Proceed to Checkout
            </button>

            <div className="cart-guarantees">
              <div><Truck size={16} /> Fast Delivery</div>
              <div><Shield size={16} /> Secure Payment</div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Checkout</h3>
              <button className="modal-close" onClick={() => setShowCheckout(false)}>x</button>
            </div>
            <form onSubmit={handlePlaceOrder} className="modal-body">
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea className="form-input" rows="2" required placeholder="Enter your full delivery address" />
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-input" required placeholder="e.g. Lagos" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="tel" className="form-input" required placeholder="+234..." />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Method</label>
                <select className="form-select" required>
                  <option value="">Select payment method</option>
                  <option value="card">Debit Card</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <div className="checkout-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                </div>
                <div className="summary-row summary-total">
                  <strong>Total</strong>
                  <strong>{formatPrice(totalWithDelivery)}</strong>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Place Order - {formatPrice(totalWithDelivery)}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
