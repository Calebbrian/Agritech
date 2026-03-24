import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Plus, X, Users, Package, Clock, CheckCircle, DollarSign,
  TrendingUp, AlertCircle, Truck
} from 'lucide-react'
import { fetchProducts } from '../../services/dataService'
import './Farmer.css'

export default function FarmerGroupDeals() {
  const navItems = getDashboardNav('farmer')
  const [deals, setDeals] = useState([])

  useEffect(() => {
    fetchProducts().then(data => {
      setDeals(data.filter(p => p.isGroupDeal).map(p => ({
        id: p.id, product: p.name, normalPrice: p.price, groupPrice: p.groupPrice || p.price,
        unit: p.unit, minBuyers: p.groupMinBuyers || 5, currentBuyers: p.groupCurrentBuyers || 0,
        deadline: p.groupDeadline || '', status: (p.groupCurrentBuyers >= p.groupMinBuyers) ? 'fulfilled' : 'active',
        totalValue: (p.groupPrice || p.price) * (p.groupCurrentBuyers || 0),
      })))
    })
  }, [])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({
    product: '', normalPrice: '', groupPrice: '', unit: '', minBuyers: '', deadline: '',
  })

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const handleCreate = (e) => {
    e.preventDefault()
    const newDeal = {
      id: Date.now(),
      product: form.product,
      normalPrice: Number(form.normalPrice),
      groupPrice: Number(form.groupPrice),
      unit: form.unit,
      minBuyers: Number(form.minBuyers),
      currentBuyers: 0,
      deadline: form.deadline,
      status: 'active',
      totalValue: 0,
    }
    setDeals(prev => [newDeal, ...prev])
    setShowCreate(false)
    setForm({ product: '', normalPrice: '', groupPrice: '', unit: '', minBuyers: '', deadline: '' })
  }

  const discount = (orig, group) => Math.round((1 - group / orig) * 100)

  return (
    <DashboardLayout navItems={navItems} title="Group Deals">
      <div className="group-buy-intro" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <Users size={24} style={{ color: '#16a34a' }} />
        <div>
          <strong style={{ color: '#166534' }}>Sell More with Group Deals</strong>
          <p style={{ color: '#166534' }}>Create a group deal to sell in bulk at a discount. You set the minimum number of buyers and a deadline. Once the minimum is reached, all buyers' orders activate and you prepare them for pickup. You get paid after delivery is confirmed.</p>
        </div>
      </div>

      {/* How it works for farmer */}
      <div className="group-how-it-works" style={{ marginBottom: 20 }}>
        <div className="group-step">
          <div className="group-step-num">1</div>
          <div><strong>Create Deal</strong><span>Set your bulk price, minimum buyers, and deadline.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">2</div>
          <div><strong>Buyers Join</strong><span>Buyers see and join your deal. They pay upfront to escrow.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">3</div>
          <div><strong>Prepare Orders</strong><span>Minimum reached! Prepare all orders for pickup.</span></div>
        </div>
        <div className="group-step-arrow">→</div>
        <div className="group-step">
          <div className="group-step-num">4</div>
          <div><strong>Get Paid</strong><span>Logistics picks up. After delivery, you get paid.</span></div>
        </div>
      </div>

      <div className="page-toolbar">
        <p className="text-muted">{deals.length} group deal(s)</p>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Create Group Deal
        </button>
      </div>

      {/* Existing Deals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        {deals.map(deal => {
          const progress = (deal.currentBuyers / deal.minBuyers) * 100
          const isFulfilled = deal.currentBuyers >= deal.minBuyers
          return (
            <div key={deal.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{deal.product}</h4>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.813rem', color: 'var(--neutral-500)' }}>
                    <span>Normal: {formatPrice(deal.normalPrice)}/{deal.unit}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Group: {formatPrice(deal.groupPrice)}/{deal.unit}</span>
                    <span>({discount(deal.normalPrice, deal.groupPrice)}% off)</span>
                  </div>
                </div>
                <span className={`badge ${isFulfilled ? 'badge-success' : 'badge-warning'}`}>
                  {isFulfilled ? 'Fulfilled — Prepare Orders' : 'Waiting for Buyers'}
                </span>
              </div>

              <div className="group-progress" style={{ marginBottom: 12 }}>
                <div className="group-progress-bar">
                  <div className="group-progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: isFulfilled ? '#16a34a' : undefined }} />
                </div>
                <span className="group-progress-text">{deal.currentBuyers}/{deal.minBuyers} buyers joined</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.813rem' }}>
                <span className="text-muted"><Clock size={12} /> Deadline: {deal.deadline}</span>
                {deal.totalValue > 0 && (
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    <DollarSign size={12} /> Total value: {formatPrice(deal.totalValue)}
                  </span>
                )}
              </div>

              {isFulfilled && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary btn-sm"><Package size={14} /> Mark Orders Ready</button>
                  <button className="btn btn-secondary btn-sm"><Truck size={14} /> Assign Logistics</button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Create Group Deal Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Group Deal</h3>
              <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label>Product</label>
                <input type="text" className="form-input" value={form.product}
                  onChange={e => setForm({ ...form, product: e.target.value })}
                  required placeholder="e.g. Fresh Tomatoes, Yellow Maize" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Normal Price (NGN)</label>
                  <input type="number" className="form-input" value={form.normalPrice}
                    onChange={e => setForm({ ...form, normalPrice: e.target.value })}
                    required placeholder="e.g. 8000" />
                </div>
                <div className="form-group">
                  <label>Group Price (NGN)</label>
                  <input type="number" className="form-input" value={form.groupPrice}
                    onChange={e => setForm({ ...form, groupPrice: e.target.value })}
                    required placeholder="e.g. 6000" />
                </div>
              </div>

              {form.normalPrice && form.groupPrice && Number(form.groupPrice) < Number(form.normalPrice) && (
                <div className="verify-result success" style={{ margin: '0 0 12px' }}>
                  <TrendingUp size={14} />
                  <span>Buyers save <strong>{discount(Number(form.normalPrice), Number(form.groupPrice))}%</strong> — {formatPrice(Number(form.normalPrice) - Number(form.groupPrice))} off per unit</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Unit of Sale</label>
                  <input type="text" className="form-input" value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    required placeholder="e.g. basket, bag, keg" />
                </div>
                <div className="form-group">
                  <label>Minimum Buyers</label>
                  <input type="number" className="form-input" value={form.minBuyers}
                    onChange={e => setForm({ ...form, minBuyers: e.target.value })}
                    required placeholder="e.g. 10" min="2" />
                </div>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" className="form-input" value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  required />
              </div>

              <div className="group-escrow-note">
                <AlertCircle size={14} />
                <span>Buyer payments are held in escrow. You get paid <strong>after delivery is confirmed</strong>. If minimum isn't reached, buyers are refunded automatically.</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Create Group Deal
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
