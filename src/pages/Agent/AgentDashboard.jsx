import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import {
  Users, Package, DollarSign, TrendingUp, CheckCircle,
  ArrowRight, AlertTriangle, Info, ShieldCheck, CreditCard, Handshake
} from 'lucide-react'
import { fetchAgentDashboard, fetchAgentFarmers, fetchOrders } from '../../services/dataService'
import '../Farmer/Farmer.css'
import './Agent.css'

export default function AgentDashboard() {
  const { user } = useAuth()
  const [agentData, setAgentData] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchAgentDashboard().then(data => setAgentData(data))
    fetchAgentFarmers().then(data => setFarmers(data))
    fetchOrders().then(data => setOrders(data))
  }, [])
  const navItems = getDashboardNav('agent')

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const totalFarmerSales = farmers.reduce((s, f) => s + f.totalSales, 0)
  const commission = Math.round(totalFarmerSales * 0.10)

  return (
    <DashboardLayout navItems={navItems} title="Agent Dashboard">
      {/* How Agent Works Banner */}
      <div className="agent-how-it-works-banner">
        <div className="agent-banner-icon"><Handshake size={28} /></div>
        <div className="agent-banner-content">
          <h3>How You Help Farmers Sell</h3>
          <p>You are the bridge between illiterate farmers and the digital marketplace. Here is your workflow:</p>
          <div className="agent-workflow-steps">
            <div className="agent-step">
              <div className="agent-step-num">1</div>
              <div>
                <strong>Visit the Farmer</strong>
                <span>Go to the farm, take photos of their produce and register them on the platform</span>
              </div>
            </div>
            <div className="agent-step-arrow"><ArrowRight size={16} /></div>
            <div className="agent-step">
              <div className="agent-step-num">2</div>
              <div>
                <strong>List Their Products</strong>
                <span>Upload photos, set prices (agreed with farmer), and publish listings on their behalf</span>
              </div>
            </div>
            <div className="agent-step-arrow"><ArrowRight size={16} /></div>
            <div className="agent-step">
              <div className="agent-step-num">3</div>
              <div>
                <strong>Manage Orders</strong>
                <span>When buyers order, you confirm with the farmer and arrange logistics for pickup</span>
              </div>
            </div>
            <div className="agent-step-arrow"><ArrowRight size={16} /></div>
            <div className="agent-step">
              <div className="agent-step-num">4</div>
              <div>
                <strong>Farmer Gets Paid</strong>
                <span>Payment goes directly to farmer's bank/mobile money. You earn 10% commission automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Protection Notice */}
      <div className="agent-payment-notice">
        <ShieldCheck size={20} />
        <div>
          <strong>Payment Protection</strong>
          <p>Buyer payments are held in escrow and released <strong>directly to the farmer's registered bank account</strong> after delivery is confirmed. Your 10% commission is auto-credited to your wallet. You never handle the farmer's money.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<Users size={24} />} label="Farmers Registered" value={farmers.length} trend="You manage these farmers" trendUp={true} />
        <StatCard icon={<Package size={24} />} label="Products Listed" value="28" trend="Across all your farmers" trendUp={true} />
        <StatCard icon={<CreditCard size={24} />} label="Your Commission (10%)" value={formatPrice(commission)} trend="Auto-credited to your wallet" trendUp={true} />
        <StatCard icon={<DollarSign size={24} />} label="Farmer Sales (Total)" value={formatPrice(totalFarmerSales)} trend="Paid directly to farmers" trendUp={true} />
      </div>

      {/* Quick Actions */}
      <div className="agent-quick-actions">
        <Link to="/agent/farmers" className="agent-action-card">
          <div className="agent-action-icon" style={{ background: '#dcfce7', color: '#16a34a' }}><Users size={24} /></div>
          <div>
            <h4>Register New Farmer</h4>
            <p>Visit a farmer, register them with their phone, photo, bank details and ID</p>
          </div>
          <ArrowRight size={20} className="agent-action-arrow" />
        </Link>
        <Link to="/agent/products" className="agent-action-card">
          <div className="agent-action-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><Package size={24} /></div>
          <div>
            <h4>List Product for Farmer</h4>
            <p>Take photos of produce, set price, and publish on behalf of a farmer</p>
          </div>
          <ArrowRight size={20} className="agent-action-arrow" />
        </Link>
        <Link to="/agent/orders" className="agent-action-card">
          <div className="agent-action-icon" style={{ background: '#fef3c7', color: '#d97706' }}><TrendingUp size={24} /></div>
          <div>
            <h4>Manage Farmer Orders</h4>
            <p>View incoming orders, confirm with farmer, and assign logistics for pickup</p>
          </div>
          <ArrowRight size={20} className="agent-action-arrow" />
        </Link>
      </div>

      {/* Farmers Overview */}
      <div className="card dashboard-card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <h3>My Farmers & Their Earnings</h3>
          <Link to="/agent/farmers" className="view-all">View All</Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Farmer</th>
                <th>Location</th>
                <th>Products</th>
                <th>Total Sales</th>
                <th>Farmer Earnings (90%)</th>
                <th>Your Commission (10%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(farmer => (
                <tr key={farmer.id}>
                  <td className="font-medium">{farmer.name}</td>
                  <td>{farmer.location}</td>
                  <td>{farmer.products}</td>
                  <td>{formatPrice(farmer.totalSales)}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatPrice(farmer.totalSales * 0.90)}</td>
                  <td style={{ color: '#2563eb', fontWeight: 600 }}>{formatPrice(farmer.totalSales * 0.10)}</td>
                  <td>
                    <span className={`badge ${farmer.verified ? 'badge-success' : 'badge-warning'}`}>
                      {farmer.verified ? 'Active' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
