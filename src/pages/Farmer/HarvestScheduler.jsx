import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  Calendar, Plus, Sprout, Sun, CloudRain, Thermometer,
  CheckCircle2, Clock, AlertTriangle, X, Droplets, Leaf, Wheat
} from 'lucide-react'
import { fetchCropCalendar, fetchUpcomingTasks, fetchBestPlantingTimes } from '../../services/dataService'
import './Farmer.css'

const statusColors = { growing: '#16a34a', planted: '#2563eb', ready: '#d97706', harvested: '#737373' }
const statusLabels = { growing: 'Growing', planted: 'Just Planted', ready: 'Ready to Harvest', harvested: 'Harvested' }
const priorityColors = { high: '#dc2626', medium: '#d97706', low: '#16a34a' }

export default function HarvestScheduler() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [activeTab, setActiveTab] = useState('schedule')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCrop, setNewCrop] = useState({ crop: '', variety: '', planted: '', expectedHarvest: '', notes: '' })
  const [cropCalendar, setCropCalendar] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [bestPlantingTimes, setBestPlantingTimes] = useState([])

  useEffect(() => {
    fetchCropCalendar().then(data => setCropCalendar(data))
    fetchUpcomingTasks().then(data => setUpcomingTasks(data))
    fetchBestPlantingTimes().then(data => setBestPlantingTimes(data))
  }, [])

  return (
    <DashboardLayout navItems={navItems} pageTitle="Harvest Scheduler">
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Active Crops', value: cropCalendar.filter(c => c.status !== 'harvested').length, icon: <Sprout size={20} />, color: '#16a34a', trend: 'Currently growing' },
          { label: 'Ready to Harvest', value: cropCalendar.filter(c => c.status === 'ready').length, icon: <Wheat size={20} />, color: '#d97706', trend: 'Harvest soon' },
          { label: 'Upcoming Tasks', value: upcomingTasks.length, icon: <Clock size={20} />, color: '#2563eb', trend: 'This week' },
          { label: 'Harvested', value: cropCalendar.filter(c => c.status === 'harvested').length, icon: <CheckCircle2 size={20} />, color: '#737373', trend: 'This season' },
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
        {['schedule', 'tasks', 'planting-guide'].map(tab => (
          <button key={tab} className={`filter-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'schedule' ? '📅 Crop Schedule' : tab === 'tasks' ? '✅ Tasks' : '🌱 Best Planting Times'}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>My Crop Schedule</h3>
            <button className="btn-primary" onClick={() => setShowAddForm(true)}><Plus size={16} /> Add Crop</button>
          </div>

          {/* Add Crop Modal */}
          {showAddForm && (
            <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                <div className="modal-header">
                  <h3>Add New Crop</h3>
                  <button className="modal-close" onClick={() => setShowAddForm(false)}><X size={20} /></button>
                </div>
                <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="form-group">
                    <label>Crop Name</label>
                    <input className="form-input" placeholder="e.g., Tomatoes" value={newCrop.crop} onChange={e => setNewCrop({ ...newCrop, crop: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Variety</label>
                    <input className="form-input" placeholder="e.g., Roma VF" value={newCrop.variety} onChange={e => setNewCrop({ ...newCrop, variety: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group">
                      <label>Date Planted</label>
                      <input type="date" className="form-input" value={newCrop.planted} onChange={e => setNewCrop({ ...newCrop, planted: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Expected Harvest</label>
                      <input type="date" className="form-input" value={newCrop.expectedHarvest} onChange={e => setNewCrop({ ...newCrop, expectedHarvest: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Notes</label>
                    <textarea className="form-input" rows={3} placeholder="Any notes..." value={newCrop.notes} onChange={e => setNewCrop({ ...newCrop, notes: e.target.value })} />
                  </div>
                  <button className="btn-primary" onClick={() => setShowAddForm(false)}>Add to Schedule</button>
                </div>
              </div>
            </div>
          )}

          {/* Crop Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {cropCalendar.map(crop => (
              <div key={crop.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{crop.icon}</span>
                    <div>
                      <h4 style={{ margin: 0 }}>{crop.crop}</h4>
                      <span style={{ fontSize: 12, color: '#737373' }}>{crop.variety}</span>
                    </div>
                  </div>
                  <span className="badge" style={{ background: `${statusColors[crop.status]}15`, color: statusColors[crop.status] }}>
                    {statusLabels[crop.status]}
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#737373' }}>
                    <span>Progress</span>
                    <span>{crop.progress}%</span>
                  </div>
                  <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${crop.progress}%`, background: statusColors[crop.status], borderRadius: 4, transition: 'width 0.3s' }} />
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252' }}>
                    <Calendar size={14} /> Planted: {new Date(crop.planted).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252' }}>
                    <Wheat size={14} /> Harvest: {new Date(crop.expectedHarvest).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252' }}>
                    <Droplets size={14} /> {crop.waterSchedule}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#525252' }}>
                    <Sun size={14} /> {crop.season}
                  </div>
                </div>

                {crop.daysLeft > 0 && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: `${statusColors[crop.status]}08`, borderRadius: 8, fontSize: 13, color: statusColors[crop.status], fontWeight: 500 }}>
                    ⏱️ {crop.daysLeft} days until harvest
                  </div>
                )}
                {crop.notes && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f8f8f8', borderRadius: 8, fontSize: 12, color: '#525252' }}>
                    📝 {crop.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
            <h3 style={{ margin: 0 }}>Upcoming Farm Tasks</h3>
          </div>
          {upcomingTasks.map(task => (
            <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ width: 4, height: 36, background: priorityColors[task.priority], borderRadius: 4 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{task.task}</div>
                <div style={{ fontSize: 12, color: '#737373' }}>{task.crop}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: priorityColors[task.priority] }}>{task.due}</div>
                <div style={{ fontSize: 11, color: '#a3a3a3', textTransform: 'capitalize' }}>{task.priority} priority</div>
              </div>
              <button className="btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}>
                <CheckCircle2 size={14} /> Done
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'planting-guide' && (
        <>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px' }}>Best Planting Times for Nigeria</h3>
            <p style={{ margin: 0, color: '#737373', fontSize: 14 }}>Recommended planting periods based on Nigerian climate zones</p>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Best Month</th>
                  <th>Season</th>
                  <th>Region</th>
                  <th>Tip</th>
                </tr>
              </thead>
              <tbody>
                {bestPlantingTimes.map((item, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{item.crop}</td>
                    <td><span className="badge" style={{ background: '#16a34a15', color: '#16a34a' }}>{item.bestMonth}</span></td>
                    <td>{item.season}</td>
                    <td>{item.region}</td>
                    <td style={{ fontSize: 13, color: '#525252' }}>{item.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
