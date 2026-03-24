import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Plus, X, Phone, MapPin, User, Package, CheckCircle, AlertCircle,
  Camera, Upload, CreditCard, Eye, DollarSign, ShieldAlert, Lock,
  AlertTriangle, Loader2, Fingerprint, ScanFace, Shield
} from 'lucide-react'
import { fetchAgentFarmers, registerFarmer, fetchProducts } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Agent.css'

export default function AgentFarmers() {
  const { user } = useAuth()
  const navItems = getDashboardNav('agent')
  const [farmersList, setFarmersList] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchAgentFarmers().then(data => setFarmersList(data))
    fetchProducts().then(data => setProducts(data))
  }, [])
  const [showRegister, setShowRegister] = useState(false)
  const [showProfile, setShowProfile] = useState(null)
  const [regStep, setRegStep] = useState(1)
  const [formData, setFormData] = useState({
    nin: '', name: '', phone: '', location: '', bankName: '', accountNumber: '', accountName: '',
    nextOfKin: '', nextOfKinPhone: '',
  })

  // Verification states
  const [ninVerifyStatus, setNinVerifyStatus] = useState(null) // null | 'verifying' | 'verified' | 'failed'
  const [ninData, setNinData] = useState(null) // simulated NIN data from NIMC
  const [photoTaken, setPhotoTaken] = useState(false)
  const [faceMatchStatus, setFaceMatchStatus] = useState(null) // null | 'matching' | 'matched' | 'failed'
  const [bankVerifyStatus, setBankVerifyStatus] = useState(null)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (regStep === 1 && (ninVerifyStatus !== 'verified' || faceMatchStatus !== 'matched')) return
    if (regStep === 2 && bankVerifyStatus !== 'matched') return
    if (regStep < 3) { setRegStep(regStep + 1); return }
    const newFarmer = {
      id: Date.now(), name: ninData?.name || formData.name, phone: formData.phone,
      location: formData.location, products: 0, totalSales: 0, rating: 0,
      joinDate: new Date().toISOString().split('T')[0], verified: true, qualityWarnings: 0,
    }
    setFarmersList(prev => [newFarmer, ...prev])
    closeRegister()
  }

  const closeRegister = () => {
    setShowRegister(false); setRegStep(1)
    setFormData({ nin: '', name: '', phone: '', location: '', bankName: '', accountNumber: '', accountName: '', nextOfKin: '', nextOfKinPhone: '' })
    setNinVerifyStatus(null); setNinData(null); setPhotoTaken(false)
    setFaceMatchStatus(null); setBankVerifyStatus(null)
  }

  // Simulate NIN verification
  const verifyNIN = () => {
    setNinVerifyStatus('verifying')
    setTimeout(() => {
      const simulatedNinData = {
        name: 'Adamu Bello Ibrahim',
        dob: '1985-03-15',
        gender: 'Male',
        state: 'Ogun',
        lga: 'Abeokuta South',
        photo: null, // Would be real photo from NIMC
      }
      setNinData(simulatedNinData)
      setFormData(prev => ({ ...prev, name: simulatedNinData.name }))
      setNinVerifyStatus('verified')
    }, 3000)
  }

  // Simulate face match
  const matchFace = () => {
    setFaceMatchStatus('matching')
    setTimeout(() => setFaceMatchStatus('matched'), 2500)
  }

  // Simulate bank verification
  const verifyBank = () => {
    setBankVerifyStatus('verifying')
    setTimeout(() => {
      setFormData(prev => ({ ...prev, accountName: ninData?.name || 'Adamu Bello Ibrahim' }))
      setBankVerifyStatus('matched')
    }, 2500)
  }

  const farmerProducts = (farmerId) => products.filter(p => p.farmerId === farmerId)

  return (
    <DashboardLayout navItems={navItems} title="My Farmers">
      <div className="agent-register-note" style={{ marginBottom: 24 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>Why Register Farmers?</strong>
        Many farmers in rural Nigeria cannot read, write, or use smartphones. As an agent, you visit these farmers, register them on FarmLink, take photos of their products, list them for sale, and manage their entire sales process. The farmer gets paid directly — you earn 10% commission on every sale.
      </div>

      <div className="page-toolbar">
        <p className="text-muted">Managing {farmersList.length} farmers</p>
        <button className="btn btn-primary" onClick={() => setShowRegister(true)}>
          <Plus size={18} /> Register New Farmer
        </button>
      </div>

      <div className="farmers-grid">
        {farmersList.map(farmer => (
          <div key={farmer.id} className="card farmer-card">
            <div className="farmer-card-header">
              <div className="farmer-card-avatar">{farmer.name.charAt(0)}</div>
              <div>
                <h4 className="farmer-card-name">{farmer.name}</h4>
                <span className={`badge ${farmer.verified ? 'badge-success' : 'badge-warning'}`}>
                  {farmer.verified ? <><CheckCircle size={12} /> NIN Verified</> : <><AlertCircle size={12} /> Pending</>}
                </span>
              </div>
            </div>
            <div className="farmer-card-details">
              <div className="farmer-detail"><Phone size={15} /><span>{farmer.phone}</span></div>
              <div className="farmer-detail"><MapPin size={15} /><span>{farmer.location}</span></div>
            </div>
            <div className="farmer-card-stats">
              <div><span className="farmer-stat-value">{farmer.products}</span><span className="farmer-stat-label">Products</span></div>
              <div><span className="farmer-stat-value">{formatPrice(farmer.totalSales)}</span><span className="farmer-stat-label">Sales</span></div>
              <div><span className="farmer-stat-value">{formatPrice(farmer.totalSales * 0.90)}</span><span className="farmer-stat-label">Farmer Earned</span></div>
            </div>
            <div className="farmer-payment-info"><CreditCard size={14} /><span>Payments go to farmer's bank account directly</span></div>
            <div className="farmer-card-actions">
              <Link to="/agent/products" className="btn btn-primary btn-sm" style={{ flex: 1 }}><Camera size={14} /> List Product</Link>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setShowProfile(farmer)}><Eye size={14} /> View Profile</button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== REGISTER FARMER MODAL ===== */}
      {showRegister && (
        <div className="modal-overlay" onClick={closeRegister}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Farmer — Step {regStep} of 3</h3>
              <button className="modal-close" onClick={closeRegister}><X size={20} /></button>
            </div>

            <div className="reg-progress">
              <div className={`reg-progress-step ${regStep >= 1 ? 'active' : ''}`}><div className="reg-dot">1</div><span>NIN & Identity</span></div>
              <div className="reg-progress-line" />
              <div className={`reg-progress-step ${regStep >= 2 ? 'active' : ''}`}><div className="reg-dot">2</div><span>Bank & Payment</span></div>
              <div className="reg-progress-line" />
              <div className={`reg-progress-step ${regStep >= 3 ? 'active' : ''}`}><div className="reg-dot">3</div><span>Farm Details</span></div>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">

              {/* ===== STEP 1: NIN Verification + Face Match ===== */}
              {regStep === 1 && (
                <>
                  <div className="nin-explainer">
                    <Shield size={20} />
                    <div>
                      <strong>Identity Verification via NIN</strong>
                      <p>Enter the farmer's NIN number. The system will pull their <strong>name, photo, and state of origin</strong> directly from the NIMC (National Identity Management Commission) database. This cannot be faked.</p>
                    </div>
                  </div>

                  {/* NIN Input + Verify */}
                  <div className="form-group">
                    <label><Fingerprint size={14} /> Farmer's NIN (11 digits)</label>
                    <div className="input-with-action">
                      <input type="text" className="form-input" value={formData.nin}
                        onChange={e => { setFormData({ ...formData, nin: e.target.value.replace(/\D/g, '') }); setNinVerifyStatus(null); setNinData(null); setFaceMatchStatus(null) }}
                        placeholder="Enter 11-digit NIN number" maxLength={11} />
                      <button type="button" className="btn btn-sm btn-primary verify-btn"
                        disabled={formData.nin.length !== 11 || ninVerifyStatus === 'verifying'}
                        onClick={verifyNIN}>
                        {ninVerifyStatus === 'verifying' ? <><Loader2 size={14} className="spin" /> Verifying...</> : <><Fingerprint size={14} /> Verify NIN</>}
                      </button>
                    </div>
                  </div>

                  {/* NIN Verification Result */}
                  {ninVerifyStatus === 'verified' && ninData && (
                    <div className="nin-result-card">
                      <div className="nin-result-header">
                        <CheckCircle size={18} />
                        <strong>NIN Verified — NIMC Record Found</strong>
                      </div>
                      <div className="nin-result-body">
                        <div className="nin-photo-placeholder">
                          <ScanFace size={32} />
                          <span>NIMC Photo</span>
                        </div>
                        <div className="nin-details">
                          <div className="nin-detail-row"><span>Full Name:</span><strong>{ninData.name}</strong></div>
                          <div className="nin-detail-row"><span>Date of Birth:</span><strong>{ninData.dob}</strong></div>
                          <div className="nin-detail-row"><span>Gender:</span><strong>{ninData.gender}</strong></div>
                          <div className="nin-detail-row"><span>State:</span><strong>{ninData.state}</strong></div>
                          <div className="nin-detail-row"><span>LGA:</span><strong>{ninData.lga}</strong></div>
                        </div>
                      </div>
                      <p className="nin-result-note"><Lock size={12} /> Name is pulled from NIMC and cannot be edited. This name must match the bank account.</p>
                    </div>
                  )}

                  {ninVerifyStatus === 'failed' && (
                    <div className="verify-result danger">
                      <AlertTriangle size={14} />
                      <div><strong>NIN Not Found</strong><p>This NIN number does not exist in the NIMC database. Check and try again.</p></div>
                    </div>
                  )}

                  {/* Face Match — Take photo and compare with NIN photo */}
                  {ninVerifyStatus === 'verified' && (
                    <div className="face-match-section">
                      <h4><ScanFace size={18} /> Facial Verification</h4>
                      <p>Take a live photo of the farmer standing in front of you. The system will compare it with the NIN photo from NIMC.</p>

                      {!photoTaken ? (
                        <button type="button" className="btn btn-secondary photo-capture-btn" onClick={() => setPhotoTaken(true)}>
                          <Camera size={18} /> Take Farmer's Live Photo
                        </button>
                      ) : faceMatchStatus === null ? (
                        <div className="face-compare">
                          <div className="face-box"><ScanFace size={28} /><span>NIN Photo</span></div>
                          <div className="face-vs">VS</div>
                          <div className="face-box"><Camera size={28} /><span>Live Photo</span></div>
                          <button type="button" className="btn btn-primary btn-sm" onClick={matchFace}>
                            <ScanFace size={14} /> Run Face Match
                          </button>
                        </div>
                      ) : faceMatchStatus === 'matching' ? (
                        <div className="verify-result pending"><Loader2 size={14} className="spin" /><span>Comparing faces with AI...</span></div>
                      ) : faceMatchStatus === 'matched' ? (
                        <div className="verify-result success">
                          <CheckCircle size={14} />
                          <div><strong>Face Match Confirmed (96.4% match)</strong><p>The person in front of you matches the NIN photo from NIMC.</p></div>
                        </div>
                      ) : (
                        <div className="verify-result danger">
                          <AlertTriangle size={14} />
                          <div><strong>Face Does Not Match</strong><p>The person does not match the NIN record. This attempt has been logged.</p></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Phone + Location (only after face match) */}
                  {faceMatchStatus === 'matched' && (
                    <>
                      <div className="form-group">
                        <label><Phone size={14} /> Farmer's Phone Number</label>
                        <input type="tel" className="form-input" value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          required placeholder="+234 800 000 0000" />
                      </div>
                      <div className="form-group">
                        <label><MapPin size={14} /> Farm Location</label>
                        <input type="text" className="form-input" value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          required placeholder="Village, LGA, State" />
                        <span className="form-hint"><MapPin size={10} /> GPS auto-captured. Must be within {ninData?.state || 'registered'} state to match NIN.</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ===== STEP 2: Bank & Payment ===== */}
              {regStep === 2 && (
                <>
                  <div className="fraud-warning-banner">
                    <ShieldAlert size={20} />
                    <div>
                      <strong>Anti-Fraud Protection</strong>
                      <p>The bank account name must match <strong>{ninData?.name || 'the NIN-verified name'}</strong> exactly. This is automatic — no one can override it.</p>
                      <ul>
                        <li>Account name auto-fetched from bank via Paystack</li>
                        <li>Must match NIN name — <strong>{ninData?.name}</strong></li>
                        <li>Agent's own accounts are auto-detected and blocked</li>
                        <li>Bank details locked after registration</li>
                      </ul>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Bank Name</label>
                    <select className="form-select" value={formData.bankName}
                      onChange={e => { setFormData({ ...formData, bankName: e.target.value }); setBankVerifyStatus(null) }} required>
                      <option value="">Select farmer's bank...</option>
                      <option value="Access Bank">Access Bank</option>
                      <option value="GTBank">GTBank</option>
                      <option value="First Bank">First Bank</option>
                      <option value="UBA">UBA</option>
                      <option value="Zenith Bank">Zenith Bank</option>
                      <option value="Union Bank">Union Bank</option>
                      <option value="Wema Bank">Wema Bank</option>
                      <option value="Kuda Bank">Kuda Bank</option>
                      <option value="OPay">OPay</option>
                      <option value="PalmPay">PalmPay</option>
                      <option value="Moniepoint">Moniepoint</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Account Number</label>
                    <div className="input-with-action">
                      <input type="text" className="form-input" value={formData.accountNumber}
                        onChange={e => { setFormData({ ...formData, accountNumber: e.target.value }); setBankVerifyStatus(null) }}
                        required placeholder="10-digit account number" maxLength={10} />
                      <button type="button" className="btn btn-sm btn-primary verify-btn"
                        disabled={formData.accountNumber.length !== 10 || !formData.bankName || bankVerifyStatus === 'verifying'}
                        onClick={verifyBank}>
                        {bankVerifyStatus === 'verifying' ? <><Loader2 size={14} className="spin" /> Verifying...</> : 'Verify Account'}
                      </button>
                    </div>
                  </div>

                  {bankVerifyStatus === 'matched' && (
                    <div className="verify-result success">
                      <CheckCircle size={14} />
                      <div>
                        <strong>Account Verified & Name Matched</strong>
                        <p>Bank Account Name: <strong>{formData.accountName}</strong></p>
                        <p>NIN Name: <strong>{ninData?.name}</strong></p>
                        <p className="verify-match-note">Names match — this account belongs to the verified farmer</p>
                      </div>
                    </div>
                  )}

                  {bankVerifyStatus === 'mismatch' && (
                    <div className="verify-result danger">
                      <AlertTriangle size={14} />
                      <div>
                        <strong>Name Mismatch — Account Blocked</strong>
                        <p>Bank account name does not match the NIN-verified name. This account cannot be used.</p>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Account Name <Lock size={12} style={{ display: 'inline' }} /></label>
                    <input type="text" className="form-input" value={formData.accountName} readOnly disabled
                      placeholder="Auto-filled after verification" />
                    <span className="form-hint"><Lock size={10} /> Auto-fetched from Paystack — cannot be edited. Must match NIN name.</span>
                  </div>

                  <div className="bank-verify-note">
                    <Lock size={16} />
                    <span>Bank details are <strong>locked</strong> after registration. Only a FarmLink admin can change them.</span>
                  </div>
                </>
              )}

              {/* ===== STEP 3: Farm Details + Emergency Contact ===== */}
              {regStep === 3 && (
                <>
                  <div className="nin-explainer" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                    <CheckCircle size={20} style={{ color: '#16a34a' }} />
                    <div>
                      <strong style={{ color: '#166534' }}>Farmer Identity Confirmed</strong>
                      <p style={{ color: '#166534' }}>
                        <strong>{ninData?.name}</strong> from <strong>{ninData?.state}</strong> has been verified via NIN.
                        Bank account matches. You can now add farm details.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>What does this farmer produce?</label>
                    <input type="text" className="form-input" placeholder="e.g. Tomatoes, Maize, Cassava, Yams" required />
                  </div>

                  <div className="form-group">
                    <label>Estimated Farm Size</label>
                    <select className="form-select" required>
                      <option value="">Select size...</option>
                      <option value="small">Small (under 1 hectare)</option>
                      <option value="medium">Medium (1-5 hectares)</option>
                      <option value="large">Large (5+ hectares)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Take Photo of the Farm</label>
                    <div className="photo-capture-zone"><Camera size={32} /><p>Take a wide photo showing the farm and crops</p><span>Helps buyers see where their food comes from</span></div>
                  </div>

                  <div className="form-group">
                    <label>Next of Kin Name</label>
                    <input type="text" className="form-input" value={formData.nextOfKin}
                      onChange={e => setFormData({ ...formData, nextOfKin: e.target.value })} required placeholder="Emergency contact" />
                  </div>
                  <div className="form-group">
                    <label>Next of Kin Phone</label>
                    <input type="tel" className="form-input" value={formData.nextOfKinPhone}
                      onChange={e => setFormData({ ...formData, nextOfKinPhone: e.target.value })} required placeholder="+234..." />
                  </div>
                </>
              )}

              <div className="reg-buttons">
                {regStep > 1 && <button type="button" className="btn btn-ghost" onClick={() => setRegStep(regStep - 1)}>Back</button>}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}
                  disabled={
                    (regStep === 1 && (ninVerifyStatus !== 'verified' || faceMatchStatus !== 'matched')) ||
                    (regStep === 2 && bankVerifyStatus !== 'matched')
                  }>
                  {regStep < 3 ? 'Continue' : 'Register Farmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== FARMER PROFILE MODAL ===== */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Farmer Profile — {showProfile.name}</h3>
              <button className="modal-close" onClick={() => setShowProfile(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="profile-hero">
                <div className="profile-avatar-lg">{showProfile.name.charAt(0)}</div>
                <div>
                  <h2 className="profile-name">{showProfile.name}</h2>
                  <p className="profile-location"><MapPin size={14} /> {showProfile.location}</p>
                  <p className="profile-phone"><Phone size={14} /> {showProfile.phone}</p>
                  <span className={`badge ${showProfile.verified ? 'badge-success' : 'badge-warning'}`}>
                    {showProfile.verified ? 'NIN Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
              <div className="profile-section">
                <h4><DollarSign size={16} /> Earnings Breakdown</h4>
                <div className="earnings-grid">
                  <div className="earnings-item"><span className="earnings-label">Total Sales</span><span className="earnings-value">{formatPrice(showProfile.totalSales)}</span></div>
                  <div className="earnings-item highlight-green"><span className="earnings-label">Farmer Received (90%)</span><span className="earnings-value">{formatPrice(showProfile.totalSales * 0.90)}</span></div>
                  <div className="earnings-item highlight-blue"><span className="earnings-label">Your Commission (10%)</span><span className="earnings-value">{formatPrice(showProfile.totalSales * 0.10)}</span></div>
                </div>
                <p className="earnings-note"><CreditCard size={14} /> All payments go directly to the farmer's NIN-verified bank account.</p>
              </div>
              <div className="profile-section">
                <h4><Package size={16} /> Products Listed ({farmerProducts(showProfile.id).length})</h4>
                {farmerProducts(showProfile.id).length > 0 ? (
                  <div className="profile-products">
                    {farmerProducts(showProfile.id).map(p => (
                      <div key={p.id} className="profile-product-item">
                        <img src={p.image} alt={p.name} />
                        <div><span className="profile-product-name">{p.name}</span><span className="profile-product-price">{formatPrice(p.price)} / {p.unit}</span></div>
                        <span className="badge badge-success">Active</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ padding: '16px 0' }}>No products listed yet.</p>
                )}
                <Link to="/agent/products" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><Camera size={14} /> List New Product</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
