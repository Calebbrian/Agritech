import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  AlertTriangle, CheckCircle, XCircle, Shield, Info
} from 'lucide-react'
import { fetchQualityAlerts } from '../../services/dataService'
import './Farmer.css'

export default function QualityAlerts() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [qualityAlerts, setQualityAlerts] = useState([])

  useEffect(() => {
    fetchQualityAlerts().then(data => setQualityAlerts(data))
  }, [])

  return (
    <DashboardLayout navItems={navItems} title="Quality Alerts & Warnings">
      {/* Warning Banner */}
      <div className="quality-banner">
        <Shield size={24} />
        <div>
          <h3>Quality Assurance Policy</h3>
          <p>FarmLink takes product quality seriously. Farmers who consistently deliver spoiled, damaged,
            or misrepresented products will face payment holds and may be suspended from the platform.
            Always ensure your products match your listing photos and descriptions.</p>
        </div>
      </div>

      <div className="quality-rules">
        <h3>How It Works</h3>
        <div className="quality-rules-grid">
          <div className="quality-rule-card">
            <div className="rule-icon warning"><AlertTriangle size={20} /></div>
            <h4>1st Warning</h4>
            <p>Payment held until replacement is sent or issue resolved with buyer. Quality photo verification required.</p>
          </div>
          <div className="quality-rule-card">
            <div className="rule-icon danger"><AlertTriangle size={20} /></div>
            <h4>2nd Warning</h4>
            <p>Payment forfeited. Full refund issued to buyer. All future listings require photo verification before approval.</p>
          </div>
          <div className="quality-rule-card">
            <div className="rule-icon critical"><XCircle size={20} /></div>
            <h4>3rd Warning</h4>
            <p>Account suspended for 30 days. Must complete quality assessment training before reactivation.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, marginTop: 24 }}>
        <div className="card-header">
          <h3>Quality Alert History</h3>
        </div>

        {qualityAlerts.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--neutral-400)' }}>
            <CheckCircle size={40} />
            <p style={{ marginTop: 12 }}>No quality alerts. Great job maintaining high standards!</p>
          </div>
        ) : (
          <div className="quality-alerts-list">
            {qualityAlerts.map(alert => (
              <div key={alert.id} className={`quality-alert-item ${alert.severity}`}>
                <div className="quality-alert-icon">
                  {alert.severity === 'critical' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div className="quality-alert-info">
                  <div className="quality-alert-header">
                    <span className="quality-alert-product">{alert.product}</span>
                    <span className={`badge ${alert.resolved ? 'badge-success' : 'badge-error'}`}>
                      {alert.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>
                  <p className="quality-alert-issue">{alert.issue}</p>
                  <div className="quality-alert-meta">
                    <span>Farmer: {alert.farmerName}</span>
                    <span>Date: {alert.date}</span>
                  </div>
                  <div className="quality-alert-penalty">
                    <Info size={14} />
                    <span>Action: {alert.penalty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
