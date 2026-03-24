import { Link } from 'react-router-dom'
import { Star, MapPin, ShoppingCart, Heart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { user } = useAuth()
  const wishlisted = isInWishlist(product.id)

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image">
        <img src={product.image} alt={product.name} />
        <span className="product-card-category">{product.category}</span>
      </Link>

      {/* Wishlist Heart */}
      {(!user || user.role === 'buyer') && (
        <button
          className={`wishlist-heart-btn ${wishlisted ? 'wishlisted' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? '#dc2626' : 'none'} stroke={wishlisted ? '#dc2626' : 'currentColor'} />
        </button>
      )}

      <div className="product-card-body">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>

        <div className="product-card-farmer">
          <MapPin size={14} />
          <span>{product.location}</span>
        </div>

        <div className="product-card-rating">
          <Star size={14} fill="#F59E0B" stroke="#F59E0B" />
          <span>{product.rating}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price">{formatPrice(product.price)}</span>
            <span className="unit">/ {product.unit}</span>
          </div>

          {(!user || user.role === 'buyer') && (
            <button
              className="add-to-cart-btn"
              onClick={(e) => {
                e.preventDefault()
                addToCart(product)
              }}
              title="Add to cart"
            >
              <ShoppingCart size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
