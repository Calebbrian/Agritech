import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import StatCard from '../../components/StatCard'
import { getDashboardNav } from '../../data/navConfig'
import {
  Wallet, ArrowDownLeft, ArrowUpRight, DollarSign,
  Clock, CheckCircle, Lock, Download, Filter
} from 'lucide-react'
import { fetchWalletBalance, fetchTransactions } from '../../services/dataService'
import './Wallet.css'

export default function WalletPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const navItems = getDashboardNav(user?.role)
  const [transactions, setTransactions] = useState([])
  const [walletData, setWalletData] = useState({ available: 0, escrow: 0, total_earned: 0 })

  useEffect(() => {
    fetchWalletBalance().then(data => setWalletData(data))
    fetchTransactions().then(data => setTransactions(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter)

  const totalBalance = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => t.type === 'credit' ? sum + t.amount : sum - t.amount, 0)

  const escrowBalance = transactions
    .filter(t => t.status === 'escrow')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingBalance = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalEarned = transactions
    .filter(t => t.type === 'credit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle size={14} />
    if (status === 'escrow') return <Lock size={14} />
    return <Clock size={14} />
  }

  const getStatusClass = (status) => {
    if (status === 'completed') return 'badge-success'
    if (status === 'escrow') return 'badge-info'
    return 'badge-warning'
  }

  return (
    <DashboardLayout navItems={navItems} title="Wallet & Transactions">
      <div className="wallet-overview">
        <div className="wallet-balance-card">
          <div className="wallet-balance-header">
            <Wallet size={24} />
            <span>Available Balance</span>
          </div>
          <div className="wallet-balance-amount">{formatPrice(totalBalance)}</div>
          <div className="wallet-balance-actions">
            <button className="btn btn-primary btn-sm">
              <Download size={16} /> Withdraw
            </button>
          </div>
        </div>

        <StatCard icon={<Lock size={24} />} label="In Escrow" value={formatPrice(escrowBalance)} trend="Protected funds" />
        <StatCard icon={<Clock size={24} />} label="Pending" value={formatPrice(pendingBalance)} trend="Awaiting confirmation" />
        <StatCard icon={<DollarSign size={24} />} label="Total Earned" value={formatPrice(totalEarned)} trend="All time" trendUp={true} />
      </div>

      <div className="escrow-notice">
        <Lock size={18} />
        <div>
          <strong>Escrow Protection Active</strong>
          <p>All buyer payments are held securely in escrow until delivery is confirmed. Funds are released directly to the farmer's or agent's registered bank account — never to personal accounts.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <h3>Transaction History</h3>
          <div className="filter-tabs">
            {['all', 'credit', 'debit'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'credit' ? 'Income' : 'Expenses'}
              </button>
            ))}
          </div>
        </div>

        <div className="transactions-list">
          {filtered.map(txn => (
            <div key={txn.id} className="transaction-item">
              <div className={`txn-icon ${txn.type}`}>
                {txn.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div className="txn-info">
                <span className="txn-desc">{txn.description}</span>
                <span className="txn-meta">
                  {txn.method} &middot; {txn.date} {txn.orderId && `· ${txn.orderId}`}
                </span>
              </div>
              <div className="txn-right">
                <span className={`txn-amount ${txn.type}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatPrice(txn.amount)}
                </span>
                <span className={`badge ${getStatusClass(txn.status)}`}>
                  {getStatusIcon(txn.status)} {txn.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
