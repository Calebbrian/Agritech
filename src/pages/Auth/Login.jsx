import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Sprout, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('buyer')
  const { login, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login({ email, password, role })
      const r = user.role || role
      const routes = {
        farmer: '/farmer/dashboard',
        agent: '/agent/dashboard',
        buyer: '/buyer/dashboard',
        logistics: '/logistics/dashboard',
        admin: '/admin/dashboard',
      }
      navigate(routes[r])
    } catch (err) {
      // error is set in AuthContext
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <Sprout size={32} />
            <span>FarmLink</span>
          </Link>
          <h1>Welcome to the Future of Farming</h1>
          <p>Connect directly with farmers, browse fresh produce, and support local agriculture across Nigeria.</p>
          <div className="auth-left-stats">
            <div>
              <strong>2,500+</strong>
              <span>Farmers</span>
            </div>
            <div>
              <strong>10K+</strong>
              <span>Buyers</span>
            </div>
            <div>
              <strong>36</strong>
              <span>States</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2>Sign In</h2>
          <p className="auth-subtitle">Enter your credentials to access your dashboard</p>

          {error && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '44px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Login As</label>
              <div className="role-selector">
                {['buyer', 'farmer', 'agent', 'logistics', 'admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`role-option ${role === r ? 'active' : ''}`}
                    onClick={() => setRole(r)}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
