import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Shield, Bell } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: '+234 801 234 5678',
    location: 'Lagos, Nigeria',
    bio: '',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardLayout navItems={navItems} title="Profile & Settings">
      <div className="profile-tabs">
        {[
          { id: 'profile', label: 'Profile', icon: <User size={16} /> },
          { id: 'security', label: 'Security', icon: <Lock size={16} /> },
          { id: 'notifications', label: 'Preferences', icon: <Bell size={16} /> },
        ].map(tab => (
          <button key={tab.id} className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">{profile.name.charAt(0)}</div>
            <button className="btn btn-secondary btn-sm"><Camera size={14} /> Change Photo</button>
          </div>

          <form onSubmit={handleSave} className="profile-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label><User size={14} /> Full Name</label>
                <input type="text" className="form-input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label><Mail size={14} /> Email</label>
                <input type="email" className="form-input" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label><Phone size={14} /> Phone</label>
                <input type="tel" className="form-input" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label><MapPin size={14} /> Location</label>
                <input type="text" className="form-input" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-input" rows="3" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." />
            </div>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}><Lock size={18} /> Change Password</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-input" placeholder="Enter current password" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" className="form-input" placeholder="Enter new password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" className="form-input" placeholder="Confirm new password" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Update Password</button>
          </form>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--neutral-200)' }}>
            <h3 style={{ marginBottom: 12 }}><Shield size={18} /> Two-Factor Authentication</h3>
            <p className="text-muted" style={{ marginBottom: 12 }}>Add an extra layer of security to your account.</p>
            <button className="btn btn-secondary">Enable 2FA</button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20 }}><Bell size={18} /> Notification Preferences</h3>
          {[
            { label: 'Order updates', desc: 'Get notified when orders are placed, confirmed, or delivered' },
            { label: 'Payment alerts', desc: 'Notifications for payments received, escrow releases' },
            { label: 'Price alerts', desc: 'Get notified when products you follow change in price' },
            { label: 'Community updates', desc: 'New posts and replies in your community feed' },
            { label: 'Promotional offers', desc: 'Deals, discounts, and seasonal promotions' },
          ].map((pref, i) => (
            <div key={i} className="pref-item">
              <div>
                <strong>{pref.label}</strong>
                <p className="text-muted">{pref.desc}</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked={i < 3} />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
