import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sprout, LogOut, Menu, X, ChevronsLeft, ChevronsRight, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import './DashboardLayout.css'

export default function DashboardLayout({ children, navItems, title }) {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={`dashboard-layout ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <a href="/" className="sidebar-logo">
            <Sprout size={24} className="sidebar-icon-fixed" />
            <span className="sidebar-label">FarmLink</span>
          </a>
          <button className="sidebar-close-mobile" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-label sidebar-user-text">
            <div className="sidebar-username">{user?.name || 'User'}</div>
            <div className="sidebar-role">{title}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {collapsed && <span className="sidebar-tooltip">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={toggleDarkMode}>
            <span className="sidebar-link-icon">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</span>
            <span className="sidebar-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            {collapsed && <span className="sidebar-tooltip">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sidebar-link-icon"><LogOut size={20} /></span>
            <span className="sidebar-label">Logout</span>
            {collapsed && <span className="sidebar-tooltip">Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button className="sidebar-toggle-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </aside>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <button className="sidebar-mobile-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="dashboard-title">{title}</h1>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}
