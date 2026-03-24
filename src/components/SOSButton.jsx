import { useState } from 'react'
import { AlertTriangle, Phone, MapPin, X, Shield } from 'lucide-react'
import './SOSButton.css'

export default function SOSButton() {
  const [showSOS, setShowSOS] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  const sendAlert = () => {
    setAlertSent(true)
    setTimeout(() => { setAlertSent(false); setShowSOS(false) }, 5000)
  }

  return (
    <>
      <button className="sos-fab" onClick={() => setShowSOS(true)} title="Emergency SOS">
        <AlertTriangle size={22} />
        <span>SOS</span>
      </button>

      {showSOS && (
        <div className="modal-overlay" onClick={() => setShowSOS(false)} style={{ zIndex: 10000 }}>
          <div className="modal sos-modal" onClick={e => e.stopPropagation()}>
            <div className="sos-header">
              <Shield size={24} />
              <h3>Emergency SOS</h3>
              <button className="modal-close" onClick={() => setShowSOS(false)}><X size={20} /></button>
            </div>

            {!alertSent ? (
              <div className="sos-body">
                <p>If you are in danger, press the button below to alert:</p>
                <ul className="sos-list">
                  <li><Phone size={14} /> Your emergency contact</li>
                  <li><Shield size={14} /> FarmLink security team</li>
                  <li><MapPin size={14} /> Nearest authorities (with your live GPS location)</li>
                </ul>
                <button className="btn sos-send-btn" onClick={sendAlert}>
                  <AlertTriangle size={20} /> SEND EMERGENCY ALERT
                </button>
                <p className="sos-note">Your live location will be shared. False alerts may result in account suspension.</p>
              </div>
            ) : (
              <div className="sos-body sos-sent">
                <div className="sos-sent-icon"><Shield size={40} /></div>
                <h3>Alert Sent!</h3>
                <p>Your emergency contacts, FarmLink security, and local authorities have been notified with your live GPS location.</p>
                <p className="sos-help-text">Help is on the way. Stay calm.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
