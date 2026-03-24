import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Leaf, Droplets, Sun, Recycle, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { fetchSustainabilityCriteria } from '../../services/dataService'

export default function SustainabilityScore() {
  const navItems = getDashboardNav('farmer')
  const [criteria, setCriteria] = useState([])

  useEffect(() => {
    fetchSustainabilityCriteria().then(data => setCriteria(data))
  }, [])

  const overallScore = criteria.length > 0 ? Math.round(criteria.reduce((s, c) => s + c.score, 0) / criteria.length) : 0

  const getScoreColor = (score) => score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  const getScoreLabel = (score) => score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'

  return (
    <DashboardLayout navItems={navItems} title="Sustainability Score">
      <div className="sustainability-intro">
        <Leaf size={20} />
        <div>
          <strong>Your Eco-Friendly Rating</strong>
          <p>Buyers increasingly prefer sustainable farms. A higher score means more visibility, a green badge on your products, and access to premium buyers.</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="card sustainability-overall">
        <div className="score-circle" style={{ borderColor: getScoreColor(overallScore) }}>
          <span className="score-value" style={{ color: getScoreColor(overallScore) }}>{overallScore}</span>
          <span className="score-label">/ 100</span>
        </div>
        <div className="score-info">
          <h3>{getScoreLabel(overallScore)}</h3>
          <p>Your farm scores {overallScore}/100 on sustainability. {overallScore >= 80 ? 'Your products display the Eco-Farmer badge!' : 'Improve your score to earn the Eco-Farmer badge (80+ required).'}</p>
          {overallScore >= 80 && (
            <div className="eco-badge-earned"><Award size={16} /> <strong>Eco-Farmer Badge Earned</strong></div>
          )}
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="sustainability-criteria">
        {criteria.map(c => (
          <div key={c.name} className="card criteria-card">
            <div className="criteria-header">
              <div className="criteria-icon" style={{ color: getScoreColor(c.score) }}>{c.icon}</div>
              <div className="criteria-info">
                <h4>{c.name}</h4>
                <p>{c.desc}</p>
              </div>
              <span className="criteria-score" style={{ color: getScoreColor(c.score) }}>{c.score}/100</span>
            </div>
            <div className="criteria-bar">
              <div className="criteria-bar-fill" style={{ width: `${c.score}%`, background: getScoreColor(c.score) }} />
            </div>
            <div className="criteria-status">
              {c.score >= 80 ? <><CheckCircle size={14} style={{ color: '#16a34a' }} /> Excellent</>
                : c.score >= 60 ? <><CheckCircle size={14} style={{ color: '#d97706' }} /> Good — room for improvement</>
                : <><AlertCircle size={14} style={{ color: '#dc2626' }} /> Needs improvement</>}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="card" style={{ padding: 24, marginTop: 20 }}>
        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} /> How to Improve Your Score</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'Use organic fertilizers like compost and manure instead of synthetic chemicals',
            'Implement rainwater harvesting or drip irrigation to conserve water',
            'Practice crop rotation to maintain soil health and reduce pest problems',
            'Compost crop residues instead of burning them',
            'Consider solar drying techniques for post-harvest processing',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: 'var(--neutral-600)' }}>
              <Leaf size={14} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
