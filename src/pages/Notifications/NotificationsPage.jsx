import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { Bell, Package, DollarSign, Truck, AlertTriangle, Star, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../services/dataService'

const typeIconMap = { order: <Package size={18} />, payment: <DollarSign size={18} />, delivery: <Truck size={18} />, alert: <AlertTriangle size={18} />, review: <Star size={18} /> }

export default function NotificationsPage() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    fetchNotifications().then(data => {
      setNotifications(data.map(n => ({ ...n, icon: typeIconMap[n.type] || <Bell size={18} /> })))
    })
  }, [])
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => { markAllNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }
  const markRead = (id) => { markNotificationRead(id); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)) }
  const deleteNotif = (id) => { deleteNotification(id); setNotifications(prev => prev.filter(n => n.id !== id)) }

  const typeColors = { order: '#2563eb', payment: '#16a34a', delivery: '#d97706', alert: '#dc2626', review: '#8b5cf6' }

  return (
    <DashboardLayout navItems={navItems} title="Notifications">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div className="filter-tabs">
          {['all', 'unread', 'order', 'payment', 'delivery', 'alert'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}><CheckCircle size={14} /> Mark all read</button>
        )}
      </div>

      <div className="notifications-list">
        {filtered.map(notif => (
          <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markRead(notif.id)}>
            <div className="notification-icon" style={{ background: `${typeColors[notif.type]}15`, color: typeColors[notif.type] }}>
              {notif.icon}
            </div>
            <div className="notification-content">
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <span className="notification-time"><Clock size={12} /> {notif.time}</span>
            </div>
            <button className="notification-delete" onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id) }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ padding: 60 }}>
            <Bell size={48} />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
