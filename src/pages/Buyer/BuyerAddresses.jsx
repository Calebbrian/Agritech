import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { MapPin, Plus, Edit2, Trash2, Star, X, CheckCircle } from 'lucide-react'
import { fetchAddresses, createAddress as createAddressAPI, deleteAddress as deleteAddressAPI } from '../../services/dataService'
import './Buyer.css'

export default function BuyerAddresses() {
  const navItems = getDashboardNav('buyer')
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    fetchAddresses().then(data => setAddresses(data))
  }, [])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ label: '', address: '', city: '', state: '', phone: '' })

  const handleAdd = (e) => {
    e.preventDefault()
    const newAddr = { ...form, id: Date.now(), isDefault: addresses.length === 0 }
    createAddressAPI(newAddr).catch(() => {})
    setAddresses(prev => [...prev, newAddr])
    setForm({ label: '', address: '', city: '', state: '', phone: '' })
    setShowModal(false)
  }

  const setDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  const deleteAddr = (id) => {
    deleteAddressAPI(id).catch(() => {})
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  return (
    <DashboardLayout navItems={navItems} title="Delivery Addresses">
      <div className="page-toolbar">
        <p className="text-muted">{addresses.length} saved address(es)</p>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Address</button>
      </div>

      <div className="addresses-grid">
        {addresses.map(addr => (
          <div key={addr.id} className={`card address-card ${addr.isDefault ? 'address-default' : ''}`}>
            {addr.isDefault && (
              <span className="address-default-badge"><CheckCircle size={12} /> Default</span>
            )}
            <h4 className="address-label">{addr.label}</h4>
            <p className="address-text">{addr.address}</p>
            <p className="address-city">{addr.city}, {addr.state}</p>
            <p className="address-phone"><MapPin size={12} /> {addr.phone}</p>
            <div className="address-actions">
              {!addr.isDefault && (
                <button className="btn btn-ghost btn-sm" onClick={() => setDefault(addr.id)}>
                  <Star size={14} /> Set Default
                </button>
              )}
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => deleteAddr(addr.id)}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Address</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-body">
              <div className="form-group">
                <label>Label</label>
                <input type="text" className="form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} required placeholder="e.g. Home, Office, Shop" />
              </div>
              <div className="form-group">
                <label>Full Address</label>
                <textarea className="form-input" rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required placeholder="Street address" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" className="form-input" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" className="form-input" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+234..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Address</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
