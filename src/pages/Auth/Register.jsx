import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Sprout, User, Mail, Lock, Phone, MapPin, Eye, EyeOff,
  Handshake, ShoppingCart, Truck
} from 'lucide-react'
import FileUpload from '../../components/FileUpload'
import './Auth.css'

const roleInfo = {
  farmer: {
    icon: <Sprout size={24} />,
    title: 'Farmer',
    desc: 'List and sell your farm products directly to buyers',
    color: '#16a34a',
    bg: '#dcfce7',
  },
  agent: {
    icon: <Handshake size={24} />,
    title: 'Agent',
    desc: 'Help illiterate farmers sell their products on the marketplace',
    color: '#2563eb',
    bg: '#dbeafe',
  },
  buyer: {
    icon: <ShoppingCart size={24} />,
    title: 'Buyer',
    desc: 'Browse and purchase fresh produce from local farmers',
    color: '#d97706',
    bg: '#fef3c7',
  },
  logistics: {
    icon: <Truck size={24} />,
    title: 'Logistics Partner',
    desc: 'Deliver farm products from sellers to buyers',
    color: '#db2777',
    bg: '#fce7f3',
  },
}

export default function Register() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    idType: '',
    idNumber: '',
    emergencyContact: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const { register, loading, error, setError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
        state: formData.location?.split(',').pop()?.trim(),
        city: formData.location?.split(',')[0]?.trim(),
        idType: formData.idType,
        idNumber: formData.idNumber,
      })
      navigate('/onboarding')
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
          <h1>Join the Agricultural Revolution</h1>
          <p>Create an account and start connecting with farmers, buyers, and logistics partners across Nigeria.</p>
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
          {step === 1 ? (
            <>
              <h2>Create Account</h2>
              <p className="auth-subtitle">Choose your role to get started</p>

              <div className="role-cards">
                {Object.entries(roleInfo).map(([key, info]) => (
                  <button
                    key={key}
                    className="role-card-select"
                    onClick={() => handleRoleSelect(key)}
                  >
                    <div className="role-card-icon" style={{ background: info.bg, color: info.color }}>
                      {info.icon}
                    </div>
                    <div className="role-card-info">
                      <strong>{info.title}</strong>
                      <span>{info.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button className="back-btn" onClick={() => setStep(1)}>
                ← Back to role selection
              </button>
              <h2>Register as {roleInfo[role].title}</h2>
              <p className="auth-subtitle">Fill in your details to create your account</p>

              {error && <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-icon-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      name="fullName"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+234 800 000 0000"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <div className="input-icon-wrapper">
                    <MapPin size={18} className="input-icon" />
                    <input
                      type="text"
                      name="location"
                      className="form-input"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
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
                      name="password"
                      className="form-input"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
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

                <div className="id-verification-section">
                  <h4 className="id-section-title">Identity Verification (Required)</h4>
                  <p className="id-section-desc">For the safety of all users, we require a valid means of identification.</p>

                  <div className="form-group">
                    <label>ID Type</label>
                    <select name="idType" className="form-select" value={formData.idType} onChange={handleChange} required>
                      <option value="">Select ID type...</option>
                      <option value="nin">National Identification Number (NIN)</option>
                      <option value="bvn">Bank Verification Number (BVN)</option>
                      <option value="voters">Voter's Card</option>
                      <option value="drivers">Driver's License</option>
                      <option value="passport">International Passport</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      className="form-input"
                      placeholder="Enter your ID number"
                      value={formData.idNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload ID Document</label>
                    <FileUpload
                      onUpload={(urls) => setFormData(prev => ({ ...prev, idImageUrl: urls[0] }))}
                      accept="image"
                      label="Upload a clear photo of your ID"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Emergency Contact (for security)</label>
                  <div className="input-icon-wrapper">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="emergencyContact"
                      className="form-input"
                      placeholder="Emergency contact phone number"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: '44px' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
