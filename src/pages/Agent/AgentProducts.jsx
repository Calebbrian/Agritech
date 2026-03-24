import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Plus, X, Upload, Edit2, Trash2, Camera, Info, CheckCircle, User
} from 'lucide-react'
import { fetchProducts, fetchAgentFarmers, fetchCategories } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Agent.css'

export default function AgentProducts() {
  const { user } = useAuth()
  const navItems = getDashboardNav('agent')
  const [productsList, setProductsList] = useState([])
  const [farmers, setFarmers] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts().then(data => setProductsList(data.slice(0, 8)))
    fetchAgentFarmers().then(data => setFarmers(data))
    fetchCategories().then(data => setCategories(data.filter(c => c !== 'All')))
  }, [])
  const [showModal, setShowModal] = useState(false)
  const [listStep, setListStep] = useState(1)
  const [formData, setFormData] = useState({
    farmerId: '', name: '', category: 'Vegetables', price: '', unit: '', stock: '', description: ''
  })

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const selectedFarmer = farmers.find(f => f.id === Number(formData.farmerId))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (listStep < 3) { setListStep(listStep + 1); return }
    const farmer = farmers.find(f => f.id === Number(formData.farmerId))
    const newProduct = {
      id: Date.now(), ...formData,
      price: Number(formData.price), stock: Number(formData.stock),
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop',
      farmer: farmer?.name || 'Unknown', location: farmer?.location || 'Nigeria',
      rating: 0, reviews: 0, listedByAgent: true,
    }
    setProductsList(prev => [newProduct, ...prev])
    closeModal()
  }

  const closeModal = () => {
    setShowModal(false)
    setListStep(1)
    setFormData({ farmerId: '', name: '', category: 'Vegetables', price: '', unit: '', stock: '', description: '' })
  }

  return (
    <DashboardLayout navItems={navItems} title="Farmer Products">
      {/* Explainer */}
      <div className="agent-register-note" style={{ marginBottom: 24 }}>
        <strong style={{ display: 'block', marginBottom: 4 }}>How Product Listing Works</strong>
        Visit your farmer → Take clear photos of their produce → Set the price (agree with the farmer first) → Publish on the marketplace. When a buyer purchases, you notify the farmer, arrange pickup with logistics, and the farmer gets paid directly to their bank account.
      </div>

      <div className="page-toolbar">
        <p className="text-muted">{productsList.length} products across all your farmers</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Camera size={18} />
          List Product for Farmer
        </button>
      </div>

      <div className="products-grid-dashboard">
        {productsList.map(product => (
          <div key={product.id} className="card product-manage-card">
            <div className="product-manage-img">
              <img src={product.image} alt={product.name} />
              <span className="product-manage-category">{product.category}</span>
              {product.listedByAgent && (
                <span className="agent-listed-badge">Listed by Agent</span>
              )}
            </div>
            <div className="product-manage-body">
              <h4>{product.name}</h4>
              <p className="product-manage-price">{formatPrice(product.price)} / {product.unit}</p>
              <div className="product-farmer-tag">
                <User size={12} />
                <span>Farmer: <strong>{product.farmer}</strong></span>
              </div>
              <div className="product-payment-tag">
                <CheckCircle size={12} />
                <span>Payment → Farmer's bank account</span>
              </div>
              <div className="product-manage-actions">
                <button className="btn btn-ghost btn-sm"><Edit2 size={14} /> Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}
                  onClick={() => setProductsList(prev => prev.filter(p => p.id !== product.id))}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LIST PRODUCT MODAL (Step-by-Step) ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>List Product — Step {listStep} of 3</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="reg-progress">
              <div className={`reg-progress-step ${listStep >= 1 ? 'active' : ''}`}>
                <div className="reg-dot">1</div><span>Select Farmer</span>
              </div>
              <div className="reg-progress-line" />
              <div className={`reg-progress-step ${listStep >= 2 ? 'active' : ''}`}>
                <div className="reg-dot">2</div><span>Product Details</span>
              </div>
              <div className="reg-progress-line" />
              <div className={`reg-progress-step ${listStep >= 3 ? 'active' : ''}`}>
                <div className="reg-dot">3</div><span>Photos & Confirm</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {listStep === 1 && (
                <>
                  <p className="agent-register-note">
                    Select the farmer whose product you want to list. You must have already registered this farmer on the platform. The product will appear under their name on the marketplace.
                  </p>
                  <div className="form-group">
                    <label>Select Farmer</label>
                    <select className="form-select" value={formData.farmerId}
                      onChange={e => setFormData({ ...formData, farmerId: e.target.value })} required>
                      <option value="">Choose a farmer you manage...</option>
                      {farmers.map(f => (
                        <option key={f.id} value={f.id}>{f.name} — {f.location}</option>
                      ))}
                    </select>
                  </div>
                  {selectedFarmer && (
                    <div className="selected-farmer-preview">
                      <div className="farmer-card-avatar" style={{ width: 48, height: 48, fontSize: '1.125rem' }}>
                        {selectedFarmer.name.charAt(0)}
                      </div>
                      <div>
                        <strong>{selectedFarmer.name}</strong>
                        <span>{selectedFarmer.location} · {selectedFarmer.products} products · Rating: {selectedFarmer.rating}</span>
                        <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>
                          ✅ Payments go to this farmer's bank account
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {listStep === 2 && (
                <>
                  <div className="listing-for-banner">
                    Listing product for: <strong>{selectedFarmer?.name || 'Selected Farmer'}</strong>
                  </div>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" className="form-input" value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })} required
                      placeholder="What is the farmer selling? e.g. Fresh Tomatoes" />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-select" value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Unit of Sale</label>
                      <input type="text" className="form-input" value={formData.unit}
                        onChange={e => setFormData({ ...formData, unit: e.target.value })} required
                        placeholder="e.g. basket, bag (50kg), tuber" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Unit (₦)</label>
                      <input type="number" className="form-input" value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })} required
                        placeholder="Agree price with farmer first!" />
                    </div>
                    <div className="form-group">
                      <label>Available Quantity</label>
                      <input type="number" className="form-input" value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })} required
                        placeholder="How many units available?" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-input" rows="3" value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the product quality, freshness, harvest date..." />
                  </div>
                  <div className="price-agree-note">
                    <Info size={14} />
                    <span>Always agree on the price with the farmer before listing. The price you enter is what buyers will see and pay.</span>
                  </div>
                </>
              )}

              {listStep === 3 && (
                <>
                  <div className="listing-for-banner">
                    Listing <strong>{formData.name || 'Product'}</strong> for <strong>{selectedFarmer?.name}</strong>
                  </div>
                  <div className="form-group">
                    <label>Product Photos (take at the farm)</label>
                    <div className="photo-grid-upload">
                      <div className="photo-upload-slot main">
                        <Camera size={32} />
                        <span>Main Photo</span>
                        <small>Take a clear, well-lit photo of the product</small>
                      </div>
                      <div className="photo-upload-slot"><Camera size={20} /><span>Side view</span></div>
                      <div className="photo-upload-slot"><Camera size={20} /><span>Close up</span></div>
                      <div className="photo-upload-slot"><Camera size={20} /><span>With farmer</span></div>
                    </div>
                  </div>

                  <div className="listing-summary">
                    <h4>Listing Summary</h4>
                    <div className="summary-item"><span>Farmer:</span><strong>{selectedFarmer?.name}</strong></div>
                    <div className="summary-item"><span>Product:</span><strong>{formData.name}</strong></div>
                    <div className="summary-item"><span>Price:</span><strong>{formData.price ? formatPrice(Number(formData.price)) : '—'} / {formData.unit}</strong></div>
                    <div className="summary-item"><span>Stock:</span><strong>{formData.stock} units</strong></div>
                    <div className="summary-item"><span>Category:</span><strong>{formData.category}</strong></div>
                    <div className="summary-divider" />
                    <div className="summary-item"><span>Buyer pays:</span><strong>{formData.price ? formatPrice(Number(formData.price)) : '—'}</strong></div>
                    <div className="summary-item highlight-green"><span>Farmer receives (90%):</span><strong>{formData.price ? formatPrice(Number(formData.price) * 0.90) : '—'}</strong></div>
                    <div className="summary-item highlight-blue"><span>Your commission (10%):</span><strong>{formData.price ? formatPrice(Number(formData.price) * 0.10) : '—'}</strong></div>
                  </div>
                </>
              )}

              <div className="reg-buttons">
                {listStep > 1 && (
                  <button type="button" className="btn btn-ghost" onClick={() => setListStep(listStep - 1)}>Back</button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {listStep < 3 ? 'Continue' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
