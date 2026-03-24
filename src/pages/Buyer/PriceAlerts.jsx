import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Bell, Plus, TrendingDown, TrendingUp, Trash2, X,
  CheckCircle2, AlertCircle, BellRing, BellOff, Package
} from 'lucide-react'
import { fetchPriceAlerts, deletePriceAlert, togglePriceAlert, fetchPriceHistory } from '../../services/dataService'
import './Buyer.css'

export default function PriceAlerts() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [alerts, setAlerts] = useState([])
  const [priceHistory, setPriceHistory] = useState([])

  useEffect(() => {
    fetchPriceAlerts().then(data => setAlerts(data))
    fetchPriceHistory().then(data => setPriceHistory(data))
  }, [])
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('alerts')
  const [newAlert, setNewAlert] = useState({ product: '', targetPrice: '', unit: 'basket' })

  const toggleAlert = (id) => { togglePriceAlert(id).catch(() => {}); setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a)) }
  const deleteAlert = (id) => { deletePriceAlert(id).catch(() => {}); setAlerts(alerts.filter(a => a.id !== id)) }

  const formatPrice = (p) => `₦${p.toLocaleString()}`

  return (
    <DashboardLayout navItems={navItems} pageTitle="Price Alerts">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Active Alerts', value: alerts.filter(a => a.active).length, icon: <BellRing size={20} />, color: '#2563eb', trend: 'Monitoring prices' },
          { label: 'Triggered', value: alerts.filter(a => a.triggered).length, icon: <CheckCircle2 size={20} />, color: '#16a34a', trend: 'Price dropped!' },
          { label: 'Prices Dropping', value: priceHistory.filter(p => p.trend === 'down').length, icon: <TrendingDown size={20} />, color: '#16a34a', trend: 'Good for buying' },
          { label: 'Prices Rising', value: priceHistory.filter(p => p.trend === 'up').length, icon: <TrendingUp size={20} />, color: '#dc2626', trend: 'Buy soon' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
              <span className="stat-trend" style={{ color: stat.color }}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {['alerts', 'trends'].map(tab => (
          <button key={tab} className={`filter-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'alerts' ? '🔔 My Alerts' : '📈 Price Trends'}
          </button>
        ))}
      </div>

      {activeTab === 'alerts' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>My Price Alerts</h3>
            <button className="btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> New Alert</button>
          </div>

          {/* Create Modal */}
          {showCreate && (
            <div className="modal-overlay" onClick={() => setShowCreate(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
                <div className="modal-header">
                  <h3>Create Price Alert</h3>
                  <button className="modal-close" onClick={() => setShowCreate(false)}><X size={20} /></button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label>Product</label>
                    <select className="form-input" value={newAlert.product} onChange={e => setNewAlert({ ...newAlert, product: e.target.value })}>
                      <option value="">Select a product</option>
                      <option value="Fresh Tomatoes">Fresh Tomatoes</option>
                      <option value="Brown Beans">Brown Beans</option>
                      <option value="Fresh Yam">Fresh Yam</option>
                      <option value="Palm Oil">Palm Oil</option>
                      <option value="Plantain">Plantain</option>
                      <option value="Rice">Rice</option>
                      <option value="Maize">Maize</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group">
                      <label>Alert when price drops to (₦)</label>
                      <input type="number" className="form-input" placeholder="e.g., 2000" value={newAlert.targetPrice} onChange={e => setNewAlert({ ...newAlert, targetPrice: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select className="form-input" value={newAlert.unit} onChange={e => setNewAlert({ ...newAlert, unit: e.target.value })}>
                        <option value="basket">Per Basket</option>
                        <option value="bag">Per Bag</option>
                        <option value="tuber">Per Tuber</option>
                        <option value="bunch">Per Bunch</option>
                        <option value="25L">Per 25L</option>
                        <option value="kg">Per KG</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, fontSize: 13, color: '#16a34a' }}>
                    <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                    You'll be notified instantly when the price drops to your target.
                  </div>
                  <button className="btn-primary" onClick={() => setShowCreate(false)}>Create Alert</button>
                </div>
              </div>
            </div>
          )}

          {/* Alert Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {alerts.map(alert => (
              <div key={alert.id} className="card" style={{ padding: 16, opacity: alert.active ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 32 }}>{alert.image}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{alert.product}</span>
                      {alert.triggered && <span className="badge" style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11 }}>🎉 Price Dropped!</span>}
                    </div>
                    <div style={{ fontSize: 13, color: '#737373' }}>by {alert.farmer} · per {alert.unit}</div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#a3a3a3' }}>Current Price</div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{formatPrice(alert.currentPrice)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', color: '#a3a3a3' }}>→</div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a3a3a3' }}>Alert When</div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: alert.triggered ? '#16a34a' : '#2563eb' }}>{formatPrice(alert.targetPrice)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a3a3a3' }}>Savings</div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#16a34a' }}>{formatPrice(alert.currentPrice - alert.targetPrice)}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-outline" style={{ padding: 6 }} onClick={() => toggleAlert(alert.id)} title={alert.active ? 'Pause' : 'Resume'}>
                      {alert.active ? <BellOff size={16} /> : <BellRing size={16} />}
                    </button>
                    <button className="btn-outline" style={{ padding: 6, color: '#dc2626', borderColor: '#fecaca' }} onClick={() => deleteAlert(alert.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'trends' && (
        <>
          <h3 style={{ marginBottom: 16 }}>Market Price Trends</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {priceHistory.map((item, i) => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ margin: 0 }}>{item.product}</h4>
                  <span className="badge" style={{
                    background: item.trend === 'down' ? '#dcfce7' : '#fef2f2',
                    color: item.trend === 'down' ? '#16a34a' : '#dc2626'
                  }}>
                    {item.trend === 'down' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                    {' '}{Math.abs(item.change)}%
                  </span>
                </div>
                {/* Simple bar chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginBottom: 8 }}>
                  {item.prices.map((p, j) => {
                    const maxP = Math.max(...item.prices.map(x => x.price))
                    const height = (p.price / maxP) * 100
                    return (
                      <div key={j} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500 }}>₦{(p.price / 1000).toFixed(0)}k</span>
                        <div style={{ width: '100%', height: `${height}%`, background: item.trend === 'down' ? '#16a34a' : '#dc2626', borderRadius: '4px 4px 0 0', opacity: 0.3 + (j * 0.3) }} />
                        <span style={{ fontSize: 11, color: '#737373' }}>{p.month}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ textAlign: 'center', fontSize: 13, color: item.trend === 'down' ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
                  {item.trend === 'down' ? '📉 Price is dropping — good time to buy!' : '📈 Price is rising — buy before it goes higher'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
