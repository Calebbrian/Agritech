import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
  Sprout, ShoppingCart, LogOut, User, Menu, X
} from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    const routes = {
      farmer: '/farmer/dashboard',
      agent: '/agent/dashboard',
      buyer: '/buyer/dashboard',
      logistics: '/logistics/dashboard',
    }
    return routes[user.role] || '/'
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Sprout size={28} />
          <span>FarmLink</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'active' : ''}`}>
          <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)}>Marketplace</Link>
          {user && (
            <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}>
              Dashboard
            </Link>
          )}

          <div className="navbar-actions">
            {user?.role === 'buyer' && (
              <Link to="/cart" className="cart-link" onClick={() => setMobileOpen(false)}>
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            )}

            {user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <span className="user-name">{user.name}</span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}
