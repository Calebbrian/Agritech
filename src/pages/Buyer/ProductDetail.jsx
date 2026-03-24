import { useParams, Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import ProductCard from '../../components/ProductCard'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Star, MapPin, ShoppingCart, Minus, Plus, Truck,
  Shield, Clock, ArrowLeft, Heart
} from 'lucide-react'
import { fetchProducts } from '../../services/dataService'
import { useState, useEffect } from 'react'
import './Buyer.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts().then(data => setProducts(data))
  }, [])

  const product = products.find(p => p.id === Number(id))
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const navItems = getDashboardNav('buyer')

  if (!product) {
    return (
      <DashboardLayout navItems={navItems} title="Product">
        <div className="empty-state">
          <h2>Product not found</h2>
          <Link to="/buyer/marketplace" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Marketplace
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
  }

  return (
    <DashboardLayout navItems={navItems} title={product.name}>
      <div className="breadcrumb">
        <Link to="/buyer/marketplace"><ArrowLeft size={16} /> Back to Marketplace</Link>
      </div>

      <div className="product-detail">
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.category}</span>
          <h1 className="product-detail-name">{product.name}</h1>

          <div className="product-detail-rating">
            <Star size={18} fill="#F59E0B" stroke="#F59E0B" />
            <span className="rating-value">{product.rating}</span>
            <span className="rating-count">({product.reviews} reviews)</span>
          </div>

          <div className="product-detail-farmer">
            <MapPin size={16} />
            <span>{product.farmer} - {product.location}</span>
          </div>

          <div className="product-detail-price">
            {formatPrice(product.price)}
            <span className="price-unit">/ {product.unit}</span>
          </div>

          <p className="product-detail-desc">{product.description}</p>

          <div className="product-detail-meta">
            <div className="meta-item">
              <Clock size={16} />
              <span>Harvested: {product.harvestDate}</span>
            </div>
            <div className="meta-item">
              <span className={`badge ${product.stock > 20 ? 'badge-success' : 'badge-warning'}`}>
                {product.stock > 20 ? 'In Stock' : `Only ${product.stock} left`}
              </span>
            </div>
          </div>

          <div className="product-detail-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
              <ShoppingCart size={20} />
              Add to Cart - {formatPrice(product.price * quantity)}
            </button>
            <button
              className={`btn btn-lg ${isInWishlist(product.id) ? 'btn-wishlist-active' : 'btn-secondary'}`}
              onClick={() => toggleWishlist(product)}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={20} fill={isInWishlist(product.id) ? '#dc2626' : 'none'} stroke={isInWishlist(product.id) ? '#dc2626' : 'currentColor'} />
            </button>
          </div>

          <div className="product-guarantees">
            <div className="guarantee-item">
              <Truck size={18} />
              <div>
                <strong>Fast Delivery</strong>
                <span>Delivered to your doorstep</span>
              </div>
            </div>
            <div className="guarantee-item">
              <Shield size={18} />
              <div>
                <strong>Secure Payment</strong>
                <span>Escrow-protected transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="products-grid">
            {related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
