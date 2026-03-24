import { Link } from 'react-router-dom'
import { Sprout, Mail, Phone, MapPin } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Sprout size={24} />
              <span>FarmLink</span>
            </Link>
            <p>Connecting farmers directly to markets. Empowering agriculture through technology.</p>
            <div className="footer-contact">
              <div><Mail size={16} /> <span>hello@farmlink.ng</span></div>
              <div><Phone size={16} /> <span>+234 800 FARM LINK</span></div>
              <div><MapPin size={16} /> <span>Lagos, Nigeria</span></div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/register">Become a Farmer</Link>
            <Link to="/register">Become an Agent</Link>
            <Link to="/register">Join as Logistics</Link>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <a href="#">Farming Guides</a>
            <a href="#">Market Insights</a>
            <a href="#">Weather Updates</a>
            <a href="#">Community Forum</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 FarmLink. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
