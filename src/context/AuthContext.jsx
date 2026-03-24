import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('farmlink_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('farmlink_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('farmlink_user')
      localStorage.removeItem('farmlink_token')
    }
  }, [user])

  const login = async (credentials) => {
    setLoading(true)
    setError(null)
    try {
      const res = await authAPI.login({
        email: credentials.email,
        password: credentials.password,
      })
      const { access_token, user: userData } = res.data
      localStorage.setItem('farmlink_token', access_token)
      const userObj = {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        avatar_url: userData.avatar_url,
        is_verified: userData.is_verified,
        state: userData.state,
        wallet_balance: userData.wallet_balance,
        escrow_balance: userData.escrow_balance,
        total_earned: userData.total_earned,
        rating: userData.rating,
      }
      setUser(userObj)
      setLoading(false)
      return userObj
    } catch (err) {
      // Fallback to mock login if backend is down
      if (err.code === 'ERR_NETWORK') {
        const mockUser = {
          name: credentials.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          email: credentials.email,
          role: credentials.role || 'buyer',
        }
        setUser(mockUser)
        setLoading(false)
        return mockUser
      }
      setError(err.response?.data?.detail || 'Login failed')
      setLoading(false)
      throw err
    }
  }

  const register = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const nameParts = data.fullName?.split(' ') || [data.first_name || '', data.last_name || '']
      const res = await authAPI.register({
        email: data.email,
        phone: data.phone || '+2340000000000',
        password: data.password,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ') || nameParts[0],
        role: data.role,
        state: data.state,
        city: data.city,
        nin: data.idNumber,
        id_type: data.idType,
      })
      const { access_token, user: userData } = res.data
      localStorage.setItem('farmlink_token', access_token)
      const userObj = {
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        is_verified: userData.is_verified,
      }
      setUser(userObj)
      setLoading(false)
      return userObj
    } catch (err) {
      // Fallback to mock register if backend is down
      if (err.code === 'ERR_NETWORK') {
        const mockUser = {
          name: data.fullName || data.email,
          email: data.email,
          role: data.role,
        }
        setUser(mockUser)
        setLoading(false)
        return mockUser
      }
      setError(err.response?.data?.detail || 'Registration failed')
      setLoading(false)
      throw err
    }
  }

  const logout = () => {
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
