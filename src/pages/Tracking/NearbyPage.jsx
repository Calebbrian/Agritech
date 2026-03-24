import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { MapPin, Star, Phone, MessageSquare, Navigation, Filter } from 'lucide-react'
import { fetchAgentFarmers, fetchProducts } from '../../services/dataService'
import './Tracking.css'

export default function NearbyPage() {
  const { user } = useAuth()
  const [radius, setRadius] = useState(50)
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [products, setProducts] = useState([])
  const navItems = getDashboardNav(user?.role)

  useEffect(() => {
    fetchAgentFarmers().then(data => setFarmers(data))
    fetchProducts().then(data => setProducts(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const nearbyFarmers = farmers.map(f => ({
    ...f,
    distance: (Math.random() * radius).toFixed(1),
    productList: products.filter(p => p.farmerId === f.id),
  })).sort((a, b) => a.distance - b.distance)

  return (
    <DashboardLayout navItems={navItems} title="Nearby Farmers & Agents">
      <div className="nearby-controls">
        <div className="radius-control">
          <label>Search Radius: <strong>{radius} km</strong></label>
          <input
            type="range"
            min="5"
            max="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="radius-slider"
          />
          <div className="radius-marks">
            <span>5 km</span>
            <span>50 km</span>
            <span>100 km</span>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="nearby-map">
        <div className="nearby-map-visual">
          <div className="map-center-dot">
            <Navigation size={16} />
            <span>You</span>
          </div>
          {nearbyFarmers.map((farmer, i) => (
            <div
              key={farmer.id}
              className={`map-farmer-pin ${selectedFarmer?.id === farmer.id ? 'selected' : ''}`}
              style={{
                top: `${20 + (i * 12) % 60}%`,
                left: `${15 + (i * 18) % 70}%`,
              }}
              onClick={() => setSelectedFarmer(farmer)}
              title={farmer.name}
            >
              <MapPin size={20} />
              <span className="pin-label">{farmer.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Farmers List */}
      <div className="nearby-list">
        <h3>{nearbyFarmers.length} Farmers within {radius}km</h3>
        <div className="nearby-grid">
          {nearbyFarmers.map(farmer => (
            <div
              key={farmer.id}
              className={`card nearby-farmer-card ${selectedFarmer?.id === farmer.id ? 'highlighted' : ''}`}
              onClick={() => setSelectedFarmer(farmer)}
            >
              <div className="nearby-farmer-header">
                <div className="nearby-farmer-avatar">{farmer.name.charAt(0)}</div>
                <div>
                  <h4>{farmer.name}</h4>
                  <div className="nearby-farmer-loc">
                    <MapPin size={12} /> {farmer.location}
                  </div>
                </div>
                <span className="nearby-distance">{farmer.distance} km</span>
              </div>

              <div className="nearby-farmer-stats">
                <div><Star size={14} fill="#F59E0B" stroke="#F59E0B" /> {farmer.rating}</div>
                <div>{farmer.products} products</div>
                <div className={`badge ${farmer.verified ? 'badge-success' : 'badge-warning'}`}>
                  {farmer.verified ? 'Verified' : 'Unverified'}
                </div>
              </div>

              {farmer.productList.length > 0 && (
                <div className="nearby-farmer-products">
                  {farmer.productList.slice(0, 3).map(p => (
                    <div key={p.id} className="nearby-product-chip">
                      {p.name} - {formatPrice(p.price)}
                    </div>
                  ))}
                </div>
              )}

              <div className="nearby-farmer-actions">
                <button className="btn btn-primary btn-sm"><MessageSquare size={14} /> Chat</button>
                <button className="btn btn-ghost btn-sm"><Phone size={14} /> Call</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
