import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { getDashboardNav } from '../../data/navConfig'
import { fetchMyProducts } from '../../services/dataService'
import { Package, AlertTriangle, CheckCircle, Edit2, Eye, EyeOff, TrendingDown } from 'lucide-react'
import './Farmer.css'

export default function FarmerInventory() {
  const navItems = getDashboardNav('farmer')
  const [inventory, setInventory] = useState([])

  useEffect(() => {
    fetchMyProducts().then(data => setInventory(
      data.map(p => ({ ...p, autoHide: p.stock <= 0, minStock: 10 }))
    ))
  }, [])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const lowStock = inventory.filter(p => p.stock > 0 && p.stock <= p.minStock)
  const outOfStock = inventory.filter(p => p.stock <= 0)
  const inStock = inventory.filter(p => p.stock > p.minStock)

  const updateStock = (id, newStock) => {
    setInventory(prev => prev.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, newStock), autoHide: newStock <= 0 } : p
    ))
  }

  const toggleVisibility = (id) => {
    setInventory(prev => prev.map(p =>
      p.id === id ? { ...p, autoHide: !p.autoHide } : p
    ))
  }

  return (
    <DashboardLayout navItems={navItems} title="Inventory Management">
      {/* Summary Cards */}
      <div className="inventory-summary">
        <div className="inv-card inv-instock">
          <CheckCircle size={20} />
          <div>
            <span className="inv-card-value">{inStock.length}</span>
            <span className="inv-card-label">In Stock</span>
          </div>
        </div>
        <div className="inv-card inv-low">
          <AlertTriangle size={20} />
          <div>
            <span className="inv-card-value">{lowStock.length}</span>
            <span className="inv-card-label">Low Stock</span>
          </div>
        </div>
        <div className="inv-card inv-out">
          <Package size={20} />
          <div>
            <span className="inv-card-value">{outOfStock.length}</span>
            <span className="inv-card-label">Out of Stock</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="low-stock-alert">
          <AlertTriangle size={18} />
          <span><strong>{lowStock.length} product(s)</strong> running low on stock. Update quantities to avoid missing sales.</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Min Alert</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className={item.stock <= 0 ? 'row-disabled' : item.stock <= item.minStock ? 'row-warning' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td>{formatPrice(item.price)}/{item.unit}</td>
                  <td>
                    <div className="stock-control">
                      <button onClick={() => updateStock(item.id, item.stock - 1)}>-</button>
                      <span className={item.stock <= item.minStock ? 'stock-low' : ''}>{item.stock}</span>
                      <button onClick={() => updateStock(item.id, item.stock + 1)}>+</button>
                    </div>
                  </td>
                  <td>{item.minStock}</td>
                  <td>
                    <span className={`badge ${item.stock <= 0 ? 'badge-error' : item.stock <= item.minStock ? 'badge-warning' : 'badge-success'}`}>
                      {item.stock <= 0 ? 'Out of Stock' : item.stock <= item.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleVisibility(item.id)}>
                      {item.autoHide ? <><EyeOff size={14} /> Hidden</> : <><Eye size={14} /> Visible</>}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm"><Edit2 size={14} /></button>
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
