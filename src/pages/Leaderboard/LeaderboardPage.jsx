import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Trophy, Medal, Star, TrendingUp, Award, Crown, Leaf } from 'lucide-react'
import { fetchLeaderboard, fetchBadges } from '../../services/dataService'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [period, setPeriod] = useState('monthly')
  const [topFarmers, setTopFarmers] = useState([])
  const [badges, setBadges] = useState([])

  useEffect(() => {
    fetchLeaderboard().then(data => setTopFarmers(data))
    fetchBadges().then(data => setBadges(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const rankIcons = { 0: <Trophy size={20} style={{ color: '#d97706' }} />, 1: <Medal size={20} style={{ color: '#94a3b8' }} />, 2: <Medal size={20} style={{ color: '#b45309' }} /> }

  return (
    <DashboardLayout navItems={navItems} title="Leaderboard & Badges">
      {/* Period Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={20} /> Top Selling Farmers</h3>
        <div className="filter-tabs">
          {['weekly', 'monthly', 'all-time'].map(p => (
            <button key={p} className={`filter-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="podium">
        {topFarmers.slice(0, 3).map((farmer, i) => (
          <div key={farmer.id} className={`podium-card podium-${i + 1}`}>
            <div className="podium-rank">{rankIcons[i]}</div>
            <div className="podium-avatar">{farmer.name.charAt(0)}</div>
            <h4>{farmer.name}</h4>
            <p className="text-muted">{farmer.location}</p>
            <span className="podium-sales">{formatPrice(farmer.sales)}</span>
            <div className="podium-stats">
              <span>{farmer.orders} orders</span>
              <span><Star size={12} fill="#F59E0B" stroke="#F59E0B" /> {farmer.rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Farmer</th>
                <th>Location</th>
                <th>Sales</th>
                <th>Orders</th>
                <th>Rating</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {topFarmers.map((farmer, i) => (
                <tr key={farmer.id}>
                  <td><span className="leaderboard-rank">#{i + 1}</span></td>
                  <td className="font-medium">{farmer.name}</td>
                  <td>{farmer.location}</td>
                  <td className="font-medium" style={{ color: 'var(--primary)' }}>{formatPrice(farmer.sales)}</td>
                  <td>{farmer.orders}</td>
                  <td><Star size={14} fill="#F59E0B" stroke="#F59E0B" /> {farmer.rating}</td>
                  <td><span className="gamification-badge">{farmer.badge}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge System */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Award size={18} /> Badge System</h3>
        <div className="badges-grid">
          {badges.map(b => (
            <div key={b.name} className="badge-card" style={{ background: b.bg, borderColor: b.color + '33' }}>
              <div className="badge-card-icon" style={{ color: b.color }}>{b.icon}</div>
              <div>
                <strong style={{ color: b.color }}>{b.name}</strong>
                <span>{b.req}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
