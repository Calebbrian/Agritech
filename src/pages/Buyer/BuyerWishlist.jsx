import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { Heart, ShoppingCart, Trash2, Star, MapPin } from 'lucide-react'
import './Buyer.css'

export default function BuyerWishlist() {
  const navItems = getDashboardNav('buyer')
  const { addToCart } = useCart()
  const { wishlistItems, removeFromWishlist } = useWishlist()

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  return (
    <DashboardLayout navItems={navItems} title="Wishlist">
      <p className="text-muted" style={{ marginBottom: 20 }}>{wishlistItems.length} saved items</p>

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <Heart size={48} />
          <h3>Your wishlist is empty</h3>
          <p>Tap the heart icon on any product to save it here.</p>
          <Link to="/buyer/marketplace" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(product => (
            <div key={product.id} className="card wishlist-card">
              <div className="wishlist-img">
                <img src={product.image} alt={product.name} />
                <button className="wishlist-remove" onClick={() => removeFromWishlist(product.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="wishlist-body">
                <Link to={`/product/${product.id}`} className="wishlist-name">{product.name}</Link>
                <div className="wishlist-meta">
                  <span><MapPin size={12} /> {product.location}</span>
                  <span><Star size={12} fill="#F59E0B" stroke="#F59E0B" /> {product.rating}</span>
                </div>
                <div className="wishlist-price">{formatPrice(product.price)} <span>/ {product.unit}</span></div>
                <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => addToCart(product)}>
                  <ShoppingCart size={14} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
