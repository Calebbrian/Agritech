import { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Truck, Bike, Car, Edit2, Plus, X, CheckCircle } from 'lucide-react'
import './Logistics.css'

export default function LogisticsVehicle() {
  const navItems = getDashboardNav('logistics')
  const [vehicles, setVehicles] = useState([
    { id: 1, type: 'Van', plate: 'LG-234-ABC', capacity: '500kg', model: 'Toyota HiAce', active: true },
  ])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ type: 'Motorcycle', plate: '', capacity: '', model: '' })
  const [isOnline, setIsOnline] = useState(true)

  const handleAdd = (e) => {
    e.preventDefault()
    setVehicles(prev => [...prev, { ...form, id: Date.now(), active: true }])
    setForm({ type: 'Motorcycle', plate: '', capacity: '', model: '' })
    setShowModal(false)
  }

  const vehicleIcons = { Motorcycle: <Bike size={24} />, Van: <Truck size={24} />, Car: <Car size={24} />, Truck: <Truck size={24} /> }

  return (
    <DashboardLayout navItems={navItems} title="Vehicle & Availability">
      {/* Online/Offline Toggle */}
      <div className={`availability-toggle ${isOnline ? 'online' : 'offline'}`}>
        <div className="availability-info">
          <div className={`availability-dot ${isOnline ? 'dot-online' : 'dot-offline'}`} />
          <div>
            <h3>You are {isOnline ? 'Online' : 'Offline'}</h3>
            <p>{isOnline ? 'You can receive delivery requests' : 'You will not receive any requests'}</p>
          </div>
        </div>
        <button className={`btn ${isOnline ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setIsOnline(!isOnline)}>
          Go {isOnline ? 'Offline' : 'Online'}
        </button>
      </div>

      {/* Vehicles */}
      <div className="page-toolbar" style={{ marginTop: 24 }}>
        <h3>My Vehicles</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Vehicle</button>
      </div>

      <div className="vehicles-grid">
        {vehicles.map(v => (
          <div key={v.id} className="card vehicle-card">
            <div className="vehicle-icon">{vehicleIcons[v.type] || <Truck size={24} />}</div>
            <div className="vehicle-info">
              <h4>{v.model}</h4>
              <p>{v.type} — {v.plate}</p>
              <p className="text-muted">Capacity: {v.capacity}</p>
            </div>
            <span className="badge badge-success"><CheckCircle size={12} /> Active</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Vehicle</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAdd} className="modal-body">
              <div className="form-group">
                <label>Vehicle Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Truck">Truck</option>
                </select>
              </div>
              <div className="form-group">
                <label>Model</label>
                <input type="text" className="form-input" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} required placeholder="e.g. Toyota HiAce" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Plate Number</label>
                  <input type="text" className="form-input" value={form.plate} onChange={e => setForm({ ...form, plate: e.target.value })} required placeholder="e.g. LG-234-ABC" />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input type="text" className="form-input" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required placeholder="e.g. 500kg" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Vehicle</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
