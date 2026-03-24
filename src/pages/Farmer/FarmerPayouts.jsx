import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { DollarSign, Download, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { fetchTransactions } from '../../services/dataService'
import './Farmer.css'

export default function FarmerPayouts() {
  const navItems = getDashboardNav('farmer')
  const [filter, setFilter] = useState('all')
  const [payouts, setPayouts] = useState([])

  useEffect(() => {
    fetchTransactions().then(data => setPayouts(data))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter)
  const totalPaid = payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const totalEscrow = payouts.filter(p => p.status === 'escrow').reduce((s, p) => s + p.amount, 0)
  const totalPending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <DashboardLayout navItems={navItems} title="Payout History">
      {/* Summary */}
      <div className="payout-summary">
        <div className="payout-stat green">
          <ArrowUpRight size={20} />
          <div>
            <span className="payout-value">{formatPrice(totalPaid)}</span>
            <span className="payout-label">Total Received</span>
          </div>
        </div>
        <div className="payout-stat orange">
          <Clock size={20} />
          <div>
            <span className="payout-value">{formatPrice(totalEscrow)}</span>
            <span className="payout-label">In Escrow</span>
          </div>
        </div>
        <div className="payout-stat blue">
          <ArrowDownRight size={20} />
          <div>
            <span className="payout-value">{formatPrice(totalPending)}</span>
            <span className="payout-label">Processing</span>
          </div>
        </div>
      </div>

      {/* Filter & Download */}
      <div className="payout-toolbar">
        <div className="filter-tabs">
          {['all', 'completed', 'escrow', 'pending'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={14} /> Export CSV</button>
      </div>

      {/* Payouts Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Product</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.id}</td>
                  <td>{p.product}</td>
                  <td>{p.buyer}</td>
                  <td className="font-medium" style={{ color: 'var(--primary)' }}>{formatPrice(p.amount)}</td>
                  <td>{p.method}</td>
                  <td>{p.date}</td>
                  <td>
                    <span className={`badge ${p.status === 'completed' ? 'badge-success' : p.status === 'escrow' ? 'badge-warning' : 'badge-info'}`}>
                      {p.status === 'completed' && <CheckCircle size={12} />} {p.status}
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
