import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Search, Filter, Ban, CheckCircle, Eye, MoreVertical, Shield, UserX, UserCheck } from 'lucide-react'
import { fetchAdminUsers } from '../../services/dataService'
import { adminAPI } from '../../services/api'

export default function AdminUsers() {
  const navItems = getDashboardNav('admin')
  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchAdminUsers().then(data => setUsers(data.map(u => ({
      ...u,
      status: u.is_active ? 'active' : 'banned',
      verified: u.is_verified,
      joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG') : '',
      sales: u.total_earned || 0,
    }))))
  }, [])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionMenu, setActionMenu] = useState(null)

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const banUser = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' } : u))
  const unbanUser = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u))
  const verifyUser = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, verified: true } : u))

  const roleBadgeColors = { farmer: 'badge-success', buyer: 'badge-warning', agent: 'badge-info', logistics: 'badge-info' }
  const statusColors = { active: 'badge-success', flagged: 'badge-warning', banned: 'badge-error' }

  return (
    <DashboardLayout navItems={navItems} title="User Management">
      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="admin-filters">
          <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="buyer">Buyers</option>
            <option value="agent">Agents</option>
            <option value="logistics">Logistics</option>
          </select>
          <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="flagged">Flagged</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      <p className="text-muted" style={{ marginBottom: 16 }}>{filtered.length} users found</p>

      {/* Users Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Sales/Purchases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className={user.status === 'banned' ? 'row-disabled' : ''}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="font-medium">{user.name}</span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{user.email}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${roleBadgeColors[user.role]}`}>{user.role}</span></td>
                  <td><span className={`badge ${statusColors[user.status]}`}>{user.status}</span></td>
                  <td>
                    {user.verified
                      ? <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                      : <span className="text-muted" style={{ fontSize: '0.75rem' }}>Pending</span>
                    }
                  </td>
                  <td>{user.joined}</td>
                  <td>{user.sales > 0 ? formatPrice(user.sales) : '—'}</td>
                  <td>
                    <div style={{ position: 'relative' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}>
                        <MoreVertical size={16} />
                      </button>
                      {actionMenu === user.id && (
                        <div className="admin-action-menu">
                          <button onClick={() => { setActionMenu(null) }}><Eye size={14} /> View Profile</button>
                          {!user.verified && <button onClick={() => { verifyUser(user.id); setActionMenu(null) }}><UserCheck size={14} /> Verify User</button>}
                          {user.status !== 'banned'
                            ? <button className="danger" onClick={() => { banUser(user.id); setActionMenu(null) }}><Ban size={14} /> Ban User</button>
                            : <button onClick={() => { unbanUser(user.id); setActionMenu(null) }}><UserCheck size={14} /> Unban User</button>
                          }
                        </div>
                      )}
                    </div>
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
