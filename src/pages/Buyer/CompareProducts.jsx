import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import {
  GitCompare, Plus, X, Star, MapPin, Truck, ShoppingCart,
  CheckCircle2, XCircle, Shield, Clock, Award
} from 'lucide-react'
import { fetchProducts } from '../../services/dataService'
import './Buyer.css'

export default function CompareProducts() {
  const { user } = useAuth()
  const navItems = getDashboardNav(user?.role)
  const [allProducts, setAllProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [compareIds, setCompareIds] = useState([])

  useEffect(() => {
    fetchProducts().then(data => {
      setAllProducts(data)
      if (data.length > 0) {
        const firstName = data[0].name
        setSelectedProduct(firstName)
        setCompareIds(data.filter(p => p.name === firstName).slice(0, 3).map(p => p.id))
      }
    })
  }, [])

  const productNames = [...new Set(allProducts.map(p => p.name))]

  const availableProducts = allProducts.filter(p => p.name === selectedProduct)
  const compareList = allProducts.filter(p => compareIds.includes(p.id))

  const addToCompare = (id) => { if (compareIds.length < 4) setCompareIds([...compareIds, id]) }
  const removeFromCompare = (id) => setCompareIds(compareIds.filter(i => i !== id))

  const formatPrice = (p) => `₦${p.toLocaleString()}`
  const lowestPrice = Math.min(...compareList.map(p => p.price))
  const highestRating = Math.max(...compareList.map(p => p.rating))

  const CompareRow = ({ label, icon, values, highlight }) => (
    <tr>
      <td style={{ fontWeight: 500, fontSize: 13, color: '#525252', display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px' }}>
        {icon} {label}
      </td>
      {values.map((val, i) => (
        <td key={i} style={{ textAlign: 'center', padding: '12px 16px', fontWeight: highlight && highlight(compareList[i]) ? 700 : 400, color: highlight && highlight(compareList[i]) ? '#16a34a' : '#262626' }}>
          {val}
          {highlight && highlight(compareList[i]) && <span style={{ marginLeft: 4, color: '#16a34a', fontSize: 11 }}>✓ Best</span>}
        </td>
      ))}
    </tr>
  )

  return (
    <DashboardLayout navItems={navItems} pageTitle="Compare Products">
      {/* Product Type Selector */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <GitCompare size={20} style={{ color: '#2D6A4F' }} />
          <span style={{ fontWeight: 600 }}>Compare:</span>
          {productNames.map(name => (
            <button key={name} className={`filter-tab ${selectedProduct === name ? 'active' : ''}`}
              onClick={() => { setSelectedProduct(name); setCompareIds(allProducts.filter(p => p.name === name).slice(0, 3).map(p => p.id)) }}>
              {allProducts.find(p => p.name === name)?.image} {name}
            </button>
          ))}
        </div>
      </div>

      {/* Available sellers */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {availableProducts.filter(p => !compareIds.includes(p.id)).map(p => (
          <button key={p.id} className="btn-outline" style={{ whiteSpace: 'nowrap', fontSize: 13 }} onClick={() => addToCompare(p.id)}>
            <Plus size={14} /> {p.farmer} ({p.location})
          </button>
        ))}
      </div>

      {compareList.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Feature</th>
                {compareList.map(p => (
                  <th key={p.id} style={{ textAlign: 'center', minWidth: 180 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 28 }}>{p.image}</span>
                      <span style={{ fontWeight: 700 }}>{p.farmer}</span>
                      {compareList.length > 1 && (
                        <button onClick={() => removeFromCompare(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 11 }}>
                          <X size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Price" icon={<span>💰</span>}
                values={compareList.map(p => <span style={{ fontSize: 16, fontWeight: 700 }}>{formatPrice(p.price)}<span style={{ fontSize: 11, color: '#737373', fontWeight: 400 }}>/{p.unit}</span></span>)}
                highlight={p => p.price === lowestPrice} />
              <CompareRow label="Rating" icon={<Star size={14} />}
                values={compareList.map(p => <span>⭐ {p.rating} <span style={{ color: '#737373', fontSize: 11 }}>({p.reviews})</span></span>)}
                highlight={p => p.rating === highestRating} />
              <CompareRow label="Location" icon={<MapPin size={14} />}
                values={compareList.map(p => p.location)} />
              <CompareRow label="Quality" icon={<Award size={14} />}
                values={compareList.map(p => <span className="badge" style={{ background: p.quality === 'Grade A' || p.quality === 'Premium' ? '#dcfce7' : '#fef9c3', color: p.quality === 'Grade A' || p.quality === 'Premium' ? '#16a34a' : '#a16207' }}>{p.quality}</span>)}
                highlight={p => p.quality === 'Grade A' || p.quality === 'Premium'} />
              <CompareRow label="Delivery" icon={<Truck size={14} />}
                values={compareList.map(p => p.delivery ? <span style={{ color: '#16a34a' }}><CheckCircle2 size={14} style={{ display: 'inline' }} /> {p.deliveryTime}</span> : <span style={{ color: '#dc2626' }}><XCircle size={14} style={{ display: 'inline' }} /> Pickup only</span>)} />
              <CompareRow label="Min. Order" icon={<ShoppingCart size={14} />}
                values={compareList.map(p => `${p.minOrder} ${p.unit}${p.minOrder > 1 ? 's' : ''}`)} />
              <CompareRow label="Organic" icon={<span>🌿</span>}
                values={compareList.map(p => p.organic ? <span style={{ color: '#16a34a' }}>✅ Yes</span> : <span style={{ color: '#737373' }}>❌ No</span>)} />
              <CompareRow label="Verified" icon={<Shield size={14} />}
                values={compareList.map(p => p.verified ? <span style={{ color: '#16a34a' }}>✅ Verified</span> : <span style={{ color: '#737373' }}>⏳ Pending</span>)} />
              <CompareRow label="In Stock" icon={<span>📦</span>}
                values={compareList.map(p => p.inStock ? <span style={{ color: '#16a34a' }}>✅ Available</span> : <span style={{ color: '#dc2626' }}>❌ Out of Stock</span>)} />
              <tr>
                <td style={{ padding: '16px' }}></td>
                {compareList.map(p => (
                  <td key={p.id} style={{ textAlign: 'center', padding: '16px 20px', minWidth: 180 }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '10px 16px', whiteSpace: 'nowrap' }} disabled={!p.inStock}>
                      <ShoppingCart size={14} /> {p.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <GitCompare size={48} style={{ color: '#d4d4d4', margin: '0 auto 12px' }} />
          <h3 style={{ color: '#737373' }}>Select products to compare</h3>
          <p style={{ color: '#a3a3a3' }}>Choose from the buttons above to start comparing</p>
        </div>
      )}
    </DashboardLayout>
  )
}
