import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { DollarSign, Download, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { fetchAdminTransactions } from '../../services/dataService'

export default function AdminTransactions() {
  const navItems = getDashboardNav('admin')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    fetchAdminTransactions().then(data => setTransactions(data.map(t => ({
      id: t.reference,
      from: t.user_name ? `${t.user_name} (${t.user_role})` : 'System',
      to: t.category === 'order_payment' ? 'Escrow' : t.user_name || 'Unknown',
      amount: t.amount,
      platformFee: 0,
      agentFee: 0,
      date: t.created_at ? new Date(t.created_at).toLocaleDateString('en-NG') : '',
      status: t.status,
      type: t.category?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '',
    }))))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const filtered = transactions.filter(t => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase()) || t.from.toLowerCase().includes(search.toLowerCase()) || t.to.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalVolume = mockTransactions.reduce((s, t) => s + t.amount, 0)
  const totalFees = mockTransactions.reduce((s, t) => s + t.platformFee, 0)
  const escrowHeld = mockTransactions.filter(t => t.status === 'escrow').reduce((s, t) => s + t.amount, 0)

  const statusIcons = { completed: <CheckCircle size={14} />, escrow: <Clock size={14} />, refunded: <AlertTriangle size={14} /> }
  const statusBadges = { completed: 'badge-success', escrow: 'badge-warning', refunded: 'badge-error' }

  return (
    <DashboardLayout navItems={navItems} title="Transactions">
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <div className="payout-stat green"><DollarSign size={20} /><div><span className="payout-value">{formatPrice(totalVolume)}</span><span className="payout-label">Total Volume</span></div></div>
        <div className="payout-stat orange"><Clock size={20} /><div><span className="payout-value">{formatPrice(escrowHeld)}</span><span className="payout-label">In Escrow</span></div></div>
        <div className="payout-stat blue"><DollarSign size={20} /><div><span className="payout-value">{formatPrice(totalFees)}</span><span className="payout-label">Platform Fees Earned</span></div></div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input type="text" placeholder="Search by ID, sender, or recipient..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="escrow">In Escrow</option>
            <option value="refunded">Refunded</option>
          </select>
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Platform Fee</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-medium">{t.id}</td>
                  <td><span className="text-muted" style={{ fontSize: '0.75rem' }}>{t.type}</span></td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td className="font-medium">{formatPrice(t.amount)}</td>
                  <td style={{ color: 'var(--primary)' }}>{t.platformFee > 0 ? formatPrice(t.platformFee) : '—'}</td>
                  <td>{t.date}</td>
                  <td><span className={`badge ${statusBadges[t.status]}`}>{statusIcons[t.status]} {t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
